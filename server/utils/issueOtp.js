const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');
const sendEmail = require('./sendEmail');
const ExpressError = require('./ExpressError');

const TTL_MS = 10 * 60 * 1000;      // OTP valid for 10 minutes
const RESEND_GAP_MS = 60 * 1000;    // at most one OTP per minute

module.exports = async (email) => {
  const last = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_GAP_MS) {
    throw new ExpressError(429, 'Please wait a minute before requesting a new OTP');
  }

  const otp = String(crypto.randomInt(100000, 1000000));   // 6 digits, cryptographically secure

  await Otp.deleteMany({ email });                          // only the newest OTP is valid
  await Otp.create({
    email,
    otpHash: await bcrypt.hash(otp, 10),                    // stored hashed, like a password
    expiresAt: new Date(Date.now() + TTL_MS),
  });

  await sendEmail(
    email,
    'Your ShareSpace verification code',
    `Your OTP is ${otp}. It expires in 10 minutes. Do not share it with anyone.`
  );
};