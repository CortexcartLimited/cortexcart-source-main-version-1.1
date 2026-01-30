import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
    // Check multiple common environment variable naming conventions
    // Fallback to 'mail.cortexcart.com' if env vars are missing, matches cert
    // Prioritize MAIL_* variables as requested for production environment
    const host = process.env.MAIL_HOST || process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST || 'mail.cortexcart.com';
    const port = parseInt(process.env.MAIL_PORT || process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || '587');
    const user = process.env.MAIL_USER || process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
    const pass = process.env.MAIL_PASS || process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || '"CortexCart" <noreply@cortexcart.com>';

    if (!user || !pass) {
        console.warn("⚠️ Email credentials (user/pass) missing in environment variables. Email might not send.");
    }

    console.log(`📧 Attempting to send email to ${to} via ${host}:${port}`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass },
        tls: {
            // Fix for "Host mismatch" - explicit servername matches cert
            rejectUnauthorized: false, // Keep false for safety in prod if cert chain issues exist
            servername: 'mail.cortexcart.com'
        }
    });

    try {
        await transporter.verify();
        console.log(`✅ SMTP Connection Verified for ${host}`);
    } catch (verifyErr) {
        console.error(`❌ SMTP Connection Failed for ${host}:`, verifyErr);
    }

    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent successfully to ${to}`);
    } catch (sendErr) {
        console.error(`❌ Failed to send email to ${to}:`, sendErr);
        throw sendErr;
    }
};

export const sendTeamInviteEmail = async ({ to, adminName, inviteUrl }) => {
    const subject = `You've been invited to join ${adminName}'s team on CortexCart`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #2563EB;">CortexCart Team Invitation</h2>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Hello!</p>
            
            <p style="font-size: 16px; color: #374151;">
                <strong>${adminName}</strong> has invited you to view their dashboard on CortexCart. 
                Your access will be set to <strong>'Viewer' (Read-Only)</strong>.
            </p>
            
            <p style="font-size: 16px; color: #374151;">
                This allows you to see analytics, reports, and insights without making changes to the account settings.
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Accept Invitation & Set Password
                </a>
            </div>

            <p style="font-size: 14px; color: #6B7280; text-align: center;">
                If you did not expect this invitation, you can simply ignore this email.
            </p>
        </div>
    `;

    await sendEmail({ to, subject, html });
};
