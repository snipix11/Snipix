const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, subject, message, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ message: 'Unauthorized: Invalid Admin Secret' });
    }

    if (!email || !subject || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Convert newlines to <br> tags for HTML email
        const formattedMessage = message.replace(/\n/g, '<br/>');

        const mailOptions = {
            from: `"Snipix Studio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; letter-spacing: 2px;">SNIPIX STUDIO</h1>
                    </div>
                    <div style="padding: 30px; background-color: #fafafa; font-size: 15px; line-height: 1.6;">
                        ${formattedMessage}
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ message: 'Failed to send email' });
    }
}
