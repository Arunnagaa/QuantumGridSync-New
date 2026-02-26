require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post("/send-mail", async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !phone || !service || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.SUPPORT_EMAIL,
      subject: "New Service Request - QuantumGridSync",
      html: `
        <h2>New Customer Enquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Service:</b> ${service}</p>
        <p><b>Project Details:</b><br>${message}</p>
      `,
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Thank You for Contacting QuantumGridSync",
      html: `
        <h2>Dear ${name},</h2>
        <p>We received your request regarding <b>${service}</b>.</p>
        <p>Our team will contact you shortly.</p>
        <p>Regards,<br>QuantumGridSync</p>
      `,
    });

    res.status(200).json({ message: "Email Sent Successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get("/", (req, res) => {
  res.send("QuantumGridSync Mail Server Running 🚀");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});