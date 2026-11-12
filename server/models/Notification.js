const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'request_received',
        'request_approved',
        'request_rejected',
        'request_cancelled',
        'item_handed_over',
        'item_returned',
        'review_received',
        'new_report',
        'report_update',
      ],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    relatedModel: {
      type: String,
      enum: ['Request', 'Transaction', 'Review', 'Report'],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',     // points to the collection named in relatedModel
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// "my unread notifications, newest first"
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);