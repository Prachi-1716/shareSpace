const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
  },
  { timestamps: true }   // createdAt tells you when it was saved
);

// the same user cannot save the same item twice
savedItemSchema.index({ user: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('SavedItem', savedItemSchema);