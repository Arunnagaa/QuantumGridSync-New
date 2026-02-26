const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 1. Email to Admin
    const adminMailOptions = {
      from: `"${name} (Website)" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `New Lead: ${service} - from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a1a2e; margin-bottom: 20px;">New Website Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; font-weight: bold; width: 120px;">Name:</td><td style="padding: 10px 0;">${name}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; font-weight: bold;">Email:</td><td style="padding: 10px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; font-weight: bold;">Phone:</td><td style="padding: 10px 0;">${phone}</td></tr>
            <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; font-weight: bold;">Service:</td><td style="padding: 10px 0;">${service}</td></tr>
          </table>
          <div style="margin-top: 20px;">
            <p style="font-weight: bold; margin-bottom: 8px;">Message / Project Details:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${message || 'No details provided'}</div>
          </div>
        </div>
      `
    };

    // 2. Email to Customer
    const customerMailOptions = {
      from: `"QuantumGridSync" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting QuantumGridSync!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a1a2e;">Hello ${name},</h2>
          <p>Thank you for reaching out to <strong>QuantumGridSync</strong> regarding <em>${service}</em>.</p>
          <p>We have successfully received your message and our team is reviewing your request. We will get back to you at this email address or call you at ${phone} very soon.</p>
          <p style="margin-top: 25px;"><strong>Your Message to us:</strong></p>
          <blockquote style="background: #f4f4f4; border-left: 4px solid #d4922a; margin: 0; padding: 10px 15px; font-style: italic;">${message}</blockquote>
          <br/>
          <p>Best regards,<br/><strong>The QuantumGridSync Team</strong><br/><a href="https://wa.me/919840441399">+91 98404 41399</a></p>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    return res.status(200).json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('[ERROR] Failed to send email:', error);
    return res.status(500).json({ success: false, message: 'Server error: Could not send email', error: error.message });
  }
}
