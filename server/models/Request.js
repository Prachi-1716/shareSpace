const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    requestedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    requestedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: (val)=>{
                return value >= this.startDate;
            },
            message: "End date cannot be before start date",
        },
        
    },
    totalDays: {
        type: Number,
        required: true,
        min: 1,
    },
    pricePerDay:{
        type: Number,
        required: true,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    respondedAt: { type: Date },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },

}, { timestamps: true }  );

// lender's inbox: incoming requests by status
requestSchema.index({ requestedTo: 1, status: 1, createdAt: -1 });
// borrower's list: my requests
requestSchema.index({ requestedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Request", requestSchema);