import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    try {
        // 1. Retrieve the session to verify it
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items'],
        });

        // 2. Check if paid
        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
        }

        // 3. Get customer email and details
        const customerEmail = session.customer_details?.email;

        if (!customerEmail) {
            return NextResponse.json({ error: 'No email found in session' }, { status: 400 });
        }

        // 4. Determine token amount based on line item subtotal
        // We use subtotal to avoid issues with taxes affecting the matching logic.
        // In the future, we should map specific Stripe Price IDs to token amounts.

        // Fetch line items
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
        const item = lineItems.data[0];
        const priceAmount = item.amount_subtotal; // Use subtotal of the item

        let tokensToAdd = 0;

        // Logic: 
        // $9.99 (999 cents) -> 50,000
        // $19.99 (1999 cents) -> 120,000
        // $49.99 (4999 cents) -> 350,000

        // We use a small range comparison to be safe against minor inconsistencies if any,
        // though subtotal should be exact.
        if (priceAmount >= 990 && priceAmount <= 1010) tokensToAdd = 50000;
        else if (priceAmount >= 1990 && priceAmount <= 2010) tokensToAdd = 120000;
        else if (priceAmount >= 4990 && priceAmount <= 5010) tokensToAdd = 350000;
        else {
            // Fallback: roughly 50 tokens per cent ($1 = 5000 tokens)
            // This is a safe fallback to ensure the user gets *something*.
            tokensToAdd = Math.floor(priceAmount * 50);
        }

        console.log(`Processing token purchase for ${customerEmail}. Subtotal: ${priceAmount}, Tokens: ${tokensToAdd}`);

        // 5. Update Database
        // Increment the limit. 
        await db.query(
            `UPDATE sites SET gemini_token_limit = gemini_token_limit + ? WHERE user_email = ?`,
            [tokensToAdd, customerEmail]
        );

        // 6. Return Success 
        return NextResponse.json({ success: true, tokensAdded: tokensToAdd, newBalance: 'updated' });

    } catch (error) {
        console.error('Error in token callback:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
