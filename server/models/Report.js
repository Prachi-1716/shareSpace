const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "Spam",
        "Fraud",
        "Inappropriate Content",
        "Fake Listing",
        "Harassment",
        "Other"
      ]
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    status: {
      type: String,
      enum: ["Pending", "Under Review", "Resolved", "Rejected"],
      default: "Pending"
    },

    token: {
      type: String,
      unique: true,
      required: true
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Report", reportSchema);