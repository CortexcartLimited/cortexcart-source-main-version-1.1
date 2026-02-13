import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userEmail = session.user.email;

        // 1. Get Stored Credentials
        const [rows] = await db.query(
            'SELECT provider_account_id, access_token FROM social_connect WHERE user_email = ? AND platform = ?',
            [userEmail, 'quickfile']
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Not connected' }, { status: 401 });
        }

        const accountNumber = rows[0].provider_account_id;
        const apiKey = decrypt(rows[0].access_token);

        // 2. Prepare API Call
        // We'll fetch the Profit and Loss report for the current year.
        // Endpoint: Report/ProfitAndLoss

        const submissionNumber = crypto.randomUUID();
        const md5 = crypto.createHash('md5');
        const signature = md5.update(`${accountNumber}${apiKey}${submissionNumber}`).digest('hex');

        const currentYear = new Date().getFullYear();

        const payload = {
            payload: {
                Header: {
                    MessageType: 'Request',
                    SubmissionNumber: submissionNumber,
                    Authentication: {
                        AccNumber: accountNumber,
                        MD5Value: signature,
                        ApplicationID: process.env.QUICKFILE_APP_ID || 'CortexCart'
                    }
                },
                Body: {
                    FromDate: `${currentYear}-01-01`,
                    ToDate: `${currentYear}-12-31`,
                    ShowMonthlyBreakdown: false
                }
            }
        };

        const response = await fetch('https://api.quickfile.co.uk/1.2/Report/ProfitAndLoss', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Quickfile API returned ${response.status}`);
        }

        const data = await response.json();
        const reportBody = data.Report_ProfitAndLoss_Response?.Body;

        if (!reportBody || reportBody.Error?.length > 0) {
            console.error('Quickfile Data Error:', reportBody?.Error);
            throw new Error('Failed to fetch report from Quickfile');
        }

        // 3. Parse Data
        // Quickfile P&L response structure needs parsing.
        // Usually returns a list of nominal codes and totals.

        // Simplified parsing logic based on typical structure:
        // We look for 'Turnover', 'CostOfSales', 'Expenses' sections or calculate from totals.
        // Assuming reportBody contains 'ProfitAndLoss_Report' object.

        // IMPORTANT: The specific structure of Quickfile's P&L JSON can vary. 
        // For robustness, we will try to find the high-level totals if available, 
        // or sum up known categories.

        // Let's assume a simpler summary structure passed back or we extract 'NetProfit'
        // If the structure is complex, we might need to iterate.
        // For this implementation, let's map what we can.

        // Fallback/Mock data extraction if exact path unknown:
        let totalRevenue = 0;
        let totalExpenses = 0;
        let netProfit = 0;

        // Trying to extract from standard keys if they exist, otherwise we might need to sum categories
        // Typical: reportBody.ProfitAndLoss_Report.Turnover.Total

        const plReport = reportBody.ProfitAndLoss_Report;

        if (plReport) {
            // Basic extraction logic
            const parseAmount = (val) => typeof val === 'number' ? val : parseFloat(val || 0);

            // Revenue usually under Turnover
            if (plReport.Turnover) {
                totalRevenue = parseAmount(plReport.Turnover.Total);
            }

            // Expenses = Cost of Sales + General Expenses
            let costOfSales = 0;
            let otherExpenses = 0;

            if (plReport.CostOfSales) costOfSales = parseAmount(plReport.CostOfSales.Total);
            if (plReport.Expenses) otherExpenses = parseAmount(plReport.Expenses.Total);

            totalExpenses = costOfSales + otherExpenses;

            // Net Profit is typically Revenue - Expenses (simplified) or provided directly
            if (plReport.NetProfit) {
                netProfit = parseAmount(plReport.NetProfit.Total);
            } else {
                netProfit = totalRevenue - totalExpenses;
            }
        }

        return NextResponse.json({
            totalRevenue,
            totalExpenses,
            netProfit
        });

    } catch (error) {
        console.error('Quickfile Summary Error:', error);
        return NextResponse.json({ error: 'Failed to load financial data' }, { status: 500 });
    }
}
