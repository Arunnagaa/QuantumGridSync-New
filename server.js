require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure NodeMailer Transport
// Note: If using Gmail, you MUST use an App Password, not your regular password.
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider (e.g., 'outlook', 'yahoo')
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/send-mail', async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
  }

  try {
    // 1. Email to the Owner/Admin (You)
    const adminMailOptions = {
      from: `"${name} (Website)" <${process.env.EMAIL_USER}>`,
      replyTo: email, // This allows you to click 'Reply' and talk directly to the customer
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER, // Who receives the notification
      subject: `New Lead: ${service} - from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a1a2e; margin-bottom: 20px;">New Website Contact Form Submission</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 10px 0;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold;">Service:</td>
              <td style="padding: 10px 0;">${service}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <p style="font-weight: bold; margin-bottom: 8px;">Message / Project Details:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${message || 'No details provided'}</div>
          </div>
        </div>
      `
    };

    // 2. Auto-Reply Email to the Customer
    const customerMailOptions = {
      from: `"QuantumGridSync" <${process.env.EMAIL_USER}>`,
      to: email, // Send to the person who filled out the form
      subject: `Thank you for contacting QuantumGridSync!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a1a2e;">Hello ${name},</h2>
          <p>Thank you for reaching out to <strong>QuantumGridSync</strong> regarding <em>${service}</em>.</p>
          <p>We have successfully received your message and our team is reviewing your request. We will get back to you at this email address or call you at ${phone} very soon.</p>
          
          <p style="margin-top: 25px;"><strong>Your Message to us:</strong></p>
          <blockquote style="background: #f4f4f4; border-left: 4px solid #d4922a; margin: 0; padding: 10px 15px; font-style: italic;">
            ${message}
          </blockquote>

          <br/>
          <p>Best regards,<br/><strong>The QuantumGridSync Team</strong><br/>
          <a href="https://wa.me/919840441399">+91 98404 41399</a></p>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);

    console.log(`[SUCCESS] Emails sent for lead: ${name}`);
    res.status(200).json({ success: true, message: 'Emails sent successfully' });

  } catch (error) {
    console.error('[ERROR] Failed to send email:', error);
    res.status(500).json({ success: false, message: 'Server error: Could not send email' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Ensure you have your .env file configured with EMAIL_USER and EMAIL_PASS');
});
