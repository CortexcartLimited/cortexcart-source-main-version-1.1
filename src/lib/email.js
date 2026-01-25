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

    const transporter = nodemailer.createTransport({
        host,
        port,
        auth: { user, pass },
    });

    await transporter.sendMail({
        from,
        to,
        subject,
        html,
    });
};
