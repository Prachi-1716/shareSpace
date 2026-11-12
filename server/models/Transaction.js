const mongoose = require('mongoose');

// reusable shape for before and after photos
const photoSetSchema = new mongoose.Schema(
  {
    images: { type: [String], default: [] },       // image URLs
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    takenAt: { type: Date },
    conditionNote: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      unique: true,              // one transaction per request
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    amountReceived: { type: Boolean, default: false },   // lender confirms cash received

    actualHandoverAt: { type: Date },
    actualReturnAt: { type: Date },

    meetupLocation: {
      type: { type: String, enum: ['Point'] },           // no default on purpose
      coordinates: { type: [Number] },                   // [longitude, latitude]
    },
    meetupAddress: { type: String, trim: true },

    beforePhotos: { type: photoSetSchema, default: undefined },
    afterPhotos: { type: photoSetSchema, default: undefined },
    borrowerAcceptedCondition: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['scheduled', 'picked_up', 'returned', 'completed', 'disputed'],
      default: 'scheduled',
    },
    statusLog: [
      {
        status: { type: String },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        _id: false,
      },
    ],
    reviewed: { type: Boolean, default: false },         // true after the borrower reviews
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);