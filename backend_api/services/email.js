// Email Service Adapter
// Easy to swap with SendGrid, Mailgun, or AWS SES
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // For Dev: Ethereal or Console
    // For Prod: Use environment variables
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'test_user',
        pass: process.env.SMTP_PASS || 'test_pass',
    },
});

const sendEmail = async (to, subject, html) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Email Service] To: ${to} | Subject: ${subject}`);
        return true;
    }

    try {
        const info = await transporter.sendMail({
            from: '"SoundProfit Support" <no-reply@soundprofit.market>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};

module.exports = { sendEmail };
