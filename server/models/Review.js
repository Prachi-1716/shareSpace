const mongoose = require('mongoose');

const ratingField = {
  type: Number,
  required: true,
  min: [1, 'Rating must be at least 1'],
  max: [5, 'Rating cannot be more than 5'],
  validate: {
    validator: Number.isInteger,
    message: 'Rating must be a whole number',
  },
};

const reviewSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      unique: true,            // one review per transaction
    },
    itemRating: ratingField,
    lenderRating: ratingField,
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }         // createdAt is added automatically
);

module.exports = mongoose.model('Review', reviewSchema);