import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
    // Check multiple common environment variable naming conventions
    // Fallback to 'panel.cortexcart.com' if env vars are missing, as confirmed by cert error
    const host = process.env.EMAIL_SERVER_HOST || process.env.MAIL_HOST || process.env.SMTP_HOST || 'panel.cortexcart.com';
    const port = parseInt(process.env.EMAIL_SERVER_PORT || process.env.MAIL_PORT || process.env.SMTP_PORT || '587');
    const user = process.env.EMAIL_SERVER_USER || process.env.MAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.MAIL_PASS || process.env.SMTP_PASS;
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
            // Fix for "Host: localhost. is not in the cert's altnames: DNS:panel.cortexcart.com"
            rejectUnauthorized: false,
            // Explicitly tell node to accept this servername if needed
            servername: 'panel.cortexcart.com'
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
