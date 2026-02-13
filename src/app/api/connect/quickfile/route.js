import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { accountNumber, apiKey } = await req.json();

        if (!accountNumber || !apiKey) {
            return NextResponse.json({ error: 'Account Number and API Key are required' }, { status: 400 });
        }

        // 1. Validate Credentials with Quickfile API
        // We'll try to fetch the account details to verify access.
        // Endpoint: Account/Get_Company_Data
        // Signature = MD5(AccountNumber + APIKey + SubmissionNumber)

        const submissionNumber = crypto.randomUUID();
        const md5 = crypto.createHash('md5');
        const signature = md5.update(`${accountNumber}${apiKey}${submissionNumber}`).digest('hex');

        // Quickfile API typically requires an Application ID for registered apps, 
        // but for direct API Key usage, it might be optional or we use a generic header.
        // Based on docs, the structure is usually:

        const payload = {
            payload: {
                Header: {
                    MessageType: 'Request',
                    SubmissionNumber: submissionNumber,
                    Authentication: {
                        AccNumber: accountNumber,
                        MD5Value: signature,
                        ApplicationID: process.env.QUICKFILE_APP_ID || 'CortexCart' // Fallback if not set
                    }
                },
                Body: {}
            }
        };

        const verifyRes = await fetch('https://api.quickfile.co.uk/1.2/Account/Get_Company_Data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!verifyRes.ok) {
            // Even if status is 200, Quickfile might return errors in the body.
            // But if the HTTP status is bad, it's definitely a failure.
            const errorText = await verifyRes.text();
            console.error('Quickfile Verification Failed:', verifyRes.status, errorText);
            return NextResponse.json({ error: 'Invalid Credentials or API Error' }, { status: 401 });
        }

        const verifyData = await verifyRes.json();

        // Check for internal API errors
        // Quickfile usually wraps responses. Error logic usually checking Body or error arrays.
        // Assuming success if we get here for now. A deeper check would inspect verifyData.Account_Get_Company_Data_Response.Body.Error

        if (verifyData.Account_Get_Company_Data_Response?.Body?.Error?.length > 0) {
            console.error('Quickfile API Error:', verifyData.Account_Get_Company_Data_Response.Body.Error);
            return NextResponse.json({ error: 'Quickfile refused credentials' }, { status: 401 });
        }


        // 2. Store Encrypted Credentials
        const encryptedApiKey = encrypt(apiKey);

        // We store 'quickfile' as the platform.
        // We can store the Account Number in 'provider_account_id' or 'access_token' (as a JSON or composite).
        // Let's store Account Number in provider_account_id and Encrypted Key in access_token.

        const userEmail = session.user.email;

        // Check if exists
        const [existing] = await db.query(
            'SELECT id FROM social_connect WHERE user_email = ? AND platform = ?',
            [userEmail, 'quickfile']
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE social_connect SET provider_account_id = ?, access_token = ?, updated_at = NOW() WHERE user_email = ? AND platform = ?',
                [accountNumber, encryptedApiKey, userEmail, 'quickfile']
            );
        } else {
            await db.query(
                'INSERT INTO social_connect (user_email, platform, provider_account_id, access_token, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [userEmail, 'quickfile', accountNumber, encryptedApiKey]
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Quickfile Connection Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
