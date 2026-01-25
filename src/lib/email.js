import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
    // defaults to env vars used in register route
    const host = process.env.EMAIL_SERVER_HOST || process.env.MAIL_HOST;
    const port = process.env.EMAIL_SERVER_PORT || process.env.MAIL_PORT || 587;
    const user = process.env.EMAIL_SERVER_USER || process.env.MAIL_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.MAIL_PASS;
    const from = process.env.EMAIL_FROM || '"CortexCart" <noreply@cortexcart.com>';

    if (!host || !user || !pass) {
        console.warn("⚠️ Email credentials missing in environment variables. Email might not send.");
    }

    console.log(`📧 Attempting to send email to ${to} via ${host}:${port}`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        auth: { user, pass },
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
