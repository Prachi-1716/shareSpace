const Item = require('../models/Items');
const User = require("../models/User");
const asyncWrap = require("../utils/asyncWrap");
const bcrypt = require('bcryptjs');
const ExpressError = require('../utils/ExpressError');
const cloudinary = require('../utils/cloudinary/cloudinary');
//update profile


const ALLOWED = ['name', 'contactNo', 'city', 'bio'];

exports.updateMe = asyncWrap(async (req, res) => {
  const updates = {};
  const body = req.body || {};

  ALLOWED.forEach((key) => {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  });

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ExpressError(404, 'User not found');
  }

  // Upload profile picture
  if (req.file) {
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'sharespace/profilePhotos',
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'limit' }
        ]
      },
      (error, result) => {
        if (error) {
          throw error;
        }
      }
    );
  }

  if (Object.keys(updates).length === 0) {
    throw new ExpressError(400, 'Nothing to update');
  }

  Object.assign(user, updates);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});




//update password

exports.changePassword = asyncWrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ExpressError(400, 'Current and new passwords are required');
  }

  if (newPassword.length < 6) {
    throw new ExpressError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new ExpressError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new ExpressError(400, 'Current password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});


// GET /api/users/:id  (public profile: no email, phone or password)
exports.getPublicProfile = asyncWrap(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name city profilePhoto bio averageRating ratingCount createdAt'
  );
  if (!user) throw new ExpressError(404, 'User not found');
  res.json({ success: true, user });
});

// GET /api/users/me/items   users items
exports.getMyItems = asyncWrap(async (req, res) => {
  const items = await Item.find({ lender: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, items });
});