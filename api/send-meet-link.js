const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, date, time, adminSecret } = req.body;

    // Basic security check to ensure only the admin can trigger this
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
            subject: 'Consultation Booking Accepted - Snipix Studio',
            html: `
                <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; letter-spacing: 2px;">SNIPIX STUDIO</h1>
                    </div>
                    <div style="padding: 30px; background-color: #fafafa;">
                        <h2 style="margin-top: 0; color: #111;">Booking Confirmed</h2>
                        <p>Hi <strong>${name}</strong>,</p>
                        <p>We have reviewed your project brief and officially accepted your consultation request!</p>
                        <p>Your session is confirmed for:</p>
                        <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 6px; margin: 20px 0; text-align: center; font-size: 16px;">
                            <strong>${date}</strong> at <strong>${time}</strong>
                        </div>
                        <p>This time slot has been successfully reserved on our calendar. I will reach out to you directly with the Google Meet link and final details shortly.</p>
                        <p>Looking forward to discussing your cinematic vision!</p>
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
