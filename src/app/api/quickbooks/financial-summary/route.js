// src/app/api/quickbooks/financial-summary/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';
import OAuthClient from 'intuit-oauth';
import axios from 'axios';

// Helper function to handle token refresh and return credentials
const getQuickBooksCredentials = async (userEmail) => {
    // --- Trim and Validate Environment Variables (Same Logic) ---
    const clientId = process.env.QUICKBOOKS_CLIENT_ID?.trim();
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET?.trim();
    const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI?.trim();

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('QuickBooks environment variables are missing or empty after trimming.');
    }

    // Hardcoding 'sandbox' for dev environment testing
    const environment = 'sandbox';

    const [connections] = await db.query(
        'SELECT access_token_encrypted, refresh_token_encrypted, realm_id FROM social_connect WHERE user_email = ? AND platform = ?',
        [userEmail, 'quickbooks']
    );

    if (!connections.length) {
        throw new Error('QuickBooks connection not found.');
    }

    const connection = connections[0];
    const realmId = connection.realm_id;
    let accessToken = decrypt(connection.access_token_encrypted);
    let refreshToken = decrypt(connection.refresh_token_encrypted);


    // Use intuit-oauth for token refresh logic
    const oauthClient = new OAuthClient({
        clientId: clientId,
        clientSecret: clientSecret,
        environment: environment,
        redirectUri: redirectUri,
    });

    // Attempt token refresh

    // Attempt token refresh with error handling
    try {
        const authResponse = await oauthClient.refreshUsingToken(refreshToken);
        const newAccessToken = authResponse.getJson().access_token;
        const newRefreshToken = authResponse.getJson().refresh_token;

        // Update tokens if they changed
        if (newAccessToken !== accessToken) {
            accessToken = newAccessToken;
            refreshToken = newRefreshToken;

            await db.query(
                'UPDATE social_connect SET access_token_encrypted = ?, refresh_token_encrypted = ? WHERE user_email = ? AND platform = ?',
                [encrypt(accessToken), encrypt(refreshToken), userEmail, 'quickbooks']
            );
        }
    } catch (refreshError) {
        console.error("QuickBooks Token Refresh Error:", refreshError);
        // Check for invalid_grant (refresh token expired/revoked)
        if (JSON.stringify(refreshError).includes('invalid_grant') || refreshError.error === 'invalid_grant') {
            const reAuthError = new Error('QUICKBOOKS_REAUTH_REQUIRED');
            reAuthError.code = 'QUICKBOOKS_REAUTH_REQUIRED';
            throw reAuthError;
        }
        throw refreshError; // Re-throw other errors
    }

    // --- Return only the necessary credentials and URL ---
    return {
        accessToken: accessToken,
        realmId: realmId,
        baseUrl: environment === 'production'
            ? 'https://quickbooks.api.intuit.com/v3'
            : 'https://sandbox-quickbooks.api.intuit.com/v3',
    };
};


export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { accessToken, realmId, baseUrl } = await getQuickBooksCredentials(session.user.email);

        const reportUrl = `${baseUrl}/company/${realmId}/reports/ProfitAndLoss?date_macro=This Fiscal Year-to-date&minorversion=65`;

        // --- FINAL FIX: Use AXIOS to make the request directly ---
        const response = await axios.get(reportUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        const pnl = response.data;

        console.log("QuickBooks P&L Report Structure:", JSON.stringify(pnl, null, 2));

        // --- EXISTING PARSING LOGIC (Remains the same) ---
        const findRowValue = (rows, target) => {
            const row = rows.find(r =>
                r.Header && r.Header.ColData && r.Header.ColData[0].value === target
            );
            return row ? row.Summary.ColData[0].value : '0';
        };

        const rows = pnl.Rows.Row || [];

        const totalRevenue = findRowValue(rows, 'Total Income');
        const totalExpenses = findRowValue(rows, 'Total Expenses');
        const netProfit = findRowValue(rows, 'Net Operating Income');

        return NextResponse.json({
            totalRevenue: parseFloat(totalRevenue).toFixed(2),
            totalExpenses: parseFloat(totalExpenses).toFixed(2),
            netProfit: parseFloat(netProfit).toFixed(2),
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching QuickBooks financial summary:', error);

        // Handle custom re-auth error
        if (error.code === 'QUICKBOOKS_REAUTH_REQUIRED' || error.message === 'QUICKBOOKS_REAUTH_REQUIRED') {
            return NextResponse.json({ message: 'QuickBooks re-authentication required', code: 'QUICKBOOKS_REAUTH_REQUIRED' }, { status: 401 });
        }

        // Check for Axios error response details
        let errorMessage = error.message;
        if (error.response && error.response.data) {
            // Intuit returns error in the response.data.Fault.Error[0].Message
            if (error.response.data.Fault?.Error?.[0]?.Message) {
                errorMessage = error.response.data.Fault.Error[0].Message;
            } else {
                errorMessage = JSON.stringify(error.response.data);
            }
        }

        return NextResponse.json({ message: `Failed to fetch data: ${errorMessage}` }, { status: 500 });
    }
}