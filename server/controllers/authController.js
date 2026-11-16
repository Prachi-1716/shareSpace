const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncWrap = require("../utils/asyncWrap");
const ExpressError = require("../utils/ExpressError");
const validator = require("validator");
const Otp = require('../models/Otp');
const issueOtp = require('../utils/issueOtp');


const cookieOptions = {
  httpOnly: true,                                   // JavaScript cannot read it
  secure: process.env.NODE_ENV === 'production',    // HTTPS only in production
  sameSite: 'lax',
};

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res
    .status(statusCode)
    .cookie('token', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePhoto: user.profilePhoto },
    });
};

//Register

exports.register = asyncWrap(async (req, res) => {
  const { name, password, contactNo, city } = req.body;
  const email = (req.body.email || '').toLowerCase().trim();

  if (!name || !email || !password || !contactNo || !city) {
    throw new ExpressError(400, 'All fields are required');
  }
  if (!validator.isEmail(email)) throw new ExpressError(400, 'Please enter a valid email address');
  if (password.length < 6) throw new ExpressError(400, 'Password must be at least 6 characters');

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ExpressError(
      409,
      existing.isVerified
        ? 'Email already registered'
        : 'Email already registered but not verified. Request a new OTP'
    );
  }

  await User.create({
    name, email, contactNo, city,
    password: await bcrypt.hash(password, 10),
  });

  await issueOtp(email);

  res.status(201).json({
    success: true,
    message: 'Account created. We sent an OTP to your email',
    email,
  });
});

exports.verifyOtp = asyncWrap(async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const otp = String(req.body.otp || '');

  const record = await Otp.findOne({ email });

  if (!record || record.expiresAt < new Date()) {
    throw new ExpressError(400, 'OTP expired or not found. Please request a new one');
  }

  if (record.attempts >= 5) {
    await record.deleteOne();
    throw new ExpressError(429, 'Too many wrong attempts. Please request a new OTP');
  }

  if (!(await bcrypt.compare(otp, record.otpHash))) {
    record.attempts += 1;
    await record.save();
    throw new ExpressError(400, 'Incorrect OTP');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ExpressError(400, 'No account found for this email');
  }

  if (user.isVerified) {
    throw new ExpressError(400, 'Email already verified');
  }

  user.isVerified = true;
  await user.save();

  await record.deleteOne();

  sendToken(user, 200, res);
});


exports.resendOtp = asyncWrap(async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();


  if (!validator.isEmail(email)) {
    throw new ExpressError(400, 'Please enter a valid email address');
  }

  const user = await User.findOne({ email });

  if (user && !user.isVerified) {
    await issueOtp(email);
  }

  res.json({
    success: true,
    message: 'If this email has an unverified account, an OTP has been sent'
  });
});

//Login
exports.login = asyncWrap(async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        throw new ExpressError(400, "Email and passwords are required"); 
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const passMatches = user && (await bcrypt.compare(password, user.password));
    if(!passMatches){
        throw new ExpressError(401, "Invalid email or password");
    }
    if (!user.isVerified) {
    throw new ExpressError(403, 'Please verify your email first');
  }
    sendToken(user, 200, res);
});

//logout
exports.logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ success: true, message: 'Logged out' });
};

