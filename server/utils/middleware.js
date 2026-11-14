const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncWrap = require('../utils/asyncWrap');
const ExpressError = require('../utils/ExpressError');

exports.protect = asyncWrap(async (req, res, next) => {
  const token = req.cookies.token;
if (!token) throw new ExpressError(401, 'Please log in first');

  // 2. Check the wristband. verify throws an error if fake or expired.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ExpressError(401, 'Session expired or invalid. Please log in again');
  }

  // 3. decoded.id is what we wrote on it. Find that user.
  const user = await User.findById(decoded.id);
  if (!user) throw new ExpressError(401, 'User no longer exists');

  // 4. Hand the user to the next function, then continue
  req.user = user;
  next();
});