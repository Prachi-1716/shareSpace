const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncWrap = require("../utils/asyncWrap");
const ExpressError = require("../utils/ExpressError");



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

//Regester
exports.register = asyncWrap(async(req, res)=>{
    const {name, email, password, contactNo, city} = req.body;
    if(!name || !email || !password || !contactNo || !city){
        throw new ExpressError(400, "All fields are required");
    }
    if(password.length < 6){
        throw new ExpressError(400, "Password must be at least 6 characters long");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name, email, password: hashedPassword, contactNo, city,
    });
    console.log(user);
    sendToken(user, 201, res);
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
    sendToken(user, 200, res);
});

//logout
exports.logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ success: true, message: 'Logged out' });
};