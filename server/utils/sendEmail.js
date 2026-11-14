const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

module.exports = (to, subject, text) =>
  transporter.sendMail({ from: `"ShareSpace" <${process.env.EMAIL_USER}>`, to, subject, text });