const mongoose = require('mongoose');
const validator = require("validator");

// random cartoon avatar, used when no profile photo is given
const styles = ['adventurer', 'big-smile', 'fun-emoji', 'lorelei', 'pixel-art'];

const randomAvatar = () => {
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed = Math.random().toString(36).slice(2, 10);
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please enter a valid email address"
      },
      trim: true,
    },
    isVerified: { type: Boolean, default: false },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // not returned in queries
    },
    contactNo: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profilePhoto: {
      type: String,
      default: randomAvatar,
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);