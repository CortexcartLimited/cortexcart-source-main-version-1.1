import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { getPlanDetails } from '@/lib/plans';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  // Helper for logging to file
  const logFile = path.join(process.cwd(), 'debug.log');
  const log = async (msg) => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${msg}\n`;
    console.log(msg); // Keep console log
    try {
      await fs.appendFile(logFile, logLine);
    } catch (e) { /* ignore file write error */ }
  };

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Get the Stripe Customer ID common to most subscription events
  const stripeCustomerId = event.data.object.customer;

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Important: Check if it's a 'subscription' mode checkout session
      if (session.mode === 'subscription') {
        const customerEmail = session.customer_details?.email;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        if (!customerEmail || !customerId || !subscriptionId) {
          await log('Webhook Error: Missing customer, email, or subscription ID in checkout.session.completed.');
          break;
        }

        try {
          // *** Fetch the subscription to get the price ID ***
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          if (!priceId) {
            await log(`Webhook Error: Could not find price ID on subscription ${subscriptionId}.`);
            break;
          }


          await log(`🔔 Webhook: Processing checkout.session.completed for ${customerEmail}`);

          // *** Database Operations ***
          // 1. Check if user exists
          await log(`🔎 Checking if user exists: ${customerEmail}`);
          const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [customerEmail]);
          let userId;

          if (existingUsers.length === 0) {
            await log(`✨ User does not exist. Creating new user for ${customerEmail}...`);
            // Create new user (No password yet)
            userId = crypto.randomUUID();
            const resetToken = crypto.randomBytes(32).toString('hex');
            // Set expiry to 24 hours from now
            const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

            try {
              // Insert User
              await db.query(
                `INSERT INTO users (id, email, name, reset_token, reset_expiry, emailVerified, created_at) 
                       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [userId, customerEmail, session.customer_details?.name || 'Valued Customer', resetToken, resetExpiry]
              );
              await log(`✅ User inserted into DB: ${userId}`);

              // Send Welcome/Set Password Email
              const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${resetToken}`;
              await log(`📧 Sending welcome email to ${customerEmail}`);
              await sendEmail({
                to: customerEmail,
                subject: 'Welcome to CortexCart! Set your password',
                html: `
                          <div style="font-family: sans-serif; padding: 20px;">
                              <h2>Welcome to CortexCart!</h2>
                              <p>Thank you for subscribing. Your account has been created.</p>
                              <p>Please click the link below to set your password and access your dashboard:</p>
                              <a href="${setPasswordUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Set Password</a>
                              <p>Or paste this link: ${setPasswordUrl}</p>
                              <p>This link expires in 24 hours.</p>
                          </div>
                      `
              });
              await log(`✅ Welcome email sent to ${customerEmail}`);
            } catch (err) {
              await log(`❌ FAILED to create user or send email: ${err.message}`);
              // Return 200 to Stripe so it doesn't retry endlessly, but log critical error
              break;
            }
          } else {
            // User exists
            userId = existingUsers[0].id;
            await log(`ℹ️ User ${customerEmail} already exists (ID: ${userId}). Linking subscription.`);
          }

          // *** NEW: Get Token Limits ***
          const plan = getPlanDetails(priceId);
          const tokenLimit = plan.limits.geminiTokens || 100000;
          await log(`📊 Plan details: ${plan.name} (Limit: ${tokenLimit})`);

          // *** Update Site/Subscription ***
          // We need to ensure a 'site' exists for this user too
          const [existingSites] = await db.query('SELECT * FROM sites WHERE user_email = ?', [customerEmail]);

          if (existingSites.length === 0) {
            await log(`Building new site entry for ${customerEmail}...`);
            await db.query(
              `INSERT INTO sites (user_email, site_name, subscription_status, stripe_customer_id, stripe_subscription_id, stripe_price_id, gemini_token_limit)
                 VALUES (?, ?, 'active', ?, ?, ?, ?)`,
              [customerEmail, `${session.customer_details?.name || 'My'}'s Site`, customerId, subscriptionId, priceId, tokenLimit]
            );
            await log(`✅ Site created successfully.`);
          } else {
            await log(`Updating existing site entry for ${customerEmail}...`);
            await db.query(
              `UPDATE sites SET 
                  subscription_status = 'active', 
                  stripe_customer_id = ?, 
                  stripe_subscription_id = ?, 
                  stripe_price_id = ?,
                  gemini_token_limit = ? 
                 WHERE user_email = ?`,
              [customerId, subscriptionId, priceId, tokenLimit, customerEmail]
            );
            await log(`✅ Site updated successfully.`);
          }
          await log(`✅ Subscription flow complete for ${customerEmail}.`);

        } catch (error) {
          await log(`Error activating subscription: ${error.message}`);
        }
      }
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      const updatedStatus = subscriptionUpdated.status;
      const updatedCustomerId = subscriptionUpdated.customer;

      // *** Get the Price ID from the updated subscription ***
      const updatedPriceId = subscriptionUpdated.items.data[0]?.price.id;

      if (!updatedCustomerId) {
        console.error(`Webhook Error: Missing customer ID on subscription.updated.`);
        break;
      }

      try {
        if (updatedPriceId) {
          // If price ID changed (upgrade/downgrade), update limit
          const plan = getPlanDetails(updatedPriceId);
          const tokenLimit = plan.limits.geminiTokens || 100000;

          await db.query(
            `UPDATE sites SET 
                    subscription_status = ?, 
                    stripe_price_id = ?, 
                    gemini_token_limit = ? 
                 WHERE stripe_customer_id = ?`,
            [updatedStatus, updatedPriceId, tokenLimit, updatedCustomerId]
          );
          console.log(`✅ Subscription updated for ${updatedCustomerId}. New Limit: ${tokenLimit}`);
        } else {
          // Just a status update (e.g. payment failure recovery)
          await db.query(
            `UPDATE sites SET subscription_status = ? WHERE stripe_customer_id = ?`,
            [updatedStatus, updatedCustomerId]
          );
          console.log(`✅ Subscription status updated to ${updatedStatus} for ${updatedCustomerId}`);
        }
      } catch (dbError) {
        console.error('Database error updating subscription:', dbError);
      }
      break;

    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      const deletedCustomerId = subscriptionDeleted.customer;

      if (!deletedCustomerId) {
        console.error(`Webhook Error: Missing customer ID on subscription.deleted.`);
        break;
      }

      try {
        // Reset status and clear limits
        await db.query(
          `UPDATE sites SET 
            subscription_status = 'canceled', 
            stripe_subscription_id = NULL, 
            stripe_price_id = NULL,
            gemini_token_limit = 0 
           WHERE stripe_customer_id = ?`,
          [deletedCustomerId]
        );
        console.log(`✅ Subscription canceled for ${deletedCustomerId}.`);
      } catch (dbError) {
        console.error('Database error handling subscription deletion:', dbError);
      }
      break;

    // --- Optional: Handle Payment Failures ---
    case 'invoice.payment_failed':
      const invoiceFailed = event.data.object;
      console.log(`⚠️ Invoice payment failed for customer ${invoiceFailed.customer}.`);
      break;

    case 'invoice.paid':
      const invoicePaid = event.data.object;
      console.log(`✅ Invoice paid for customer ${invoicePaid.customer}.`);
      break;

    default:
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  return new Response(null, { status: 200 });
}