const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, date, time, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ message: 'Unauthorized: Invalid Admin Secret' });
    }

    if (!name || !email || !date || !time) {
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

        const mailOptions = {
            from: `"Snipix Studio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Update regarding your booking with Snipix Studio',
            html: `
                <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; letter-spacing: 2px;">SNIPIX STUDIO</h1>
                    </div>
                    <div style="padding: 30px; background-color: #fafafa;">
                        <p>Hi <strong>${name}</strong>,</p>
                        <p>Thank you for reaching out and submitting your brief to Snipix Studio.</p>
                        <p>Unfortunately, we will not be able to accommodate your project consultation requested for <strong>${date}</strong> at <strong>${time}</strong>.</p>
                        <p>If you would like to reschedule for a different time in the future, please feel free to book another slot on our website.</p>
                        <br/>
                        <p>Best regards,<br/><strong>Vinay Kumar</strong><br/>Founder, Snipix Studio</p>
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
