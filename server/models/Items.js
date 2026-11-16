const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        title : {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength : 100,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: 1000,
        },
        images: {
            type: [String],
            required: true,
            validate: [(arr) => arr.length > 0, 'At least one image is required'],
        },
        imagePublicIds: {
            type: [String],
            default: []
        },
        category: {
            type: String,
            required: true,
            enum: ["Tools", "Kitchen", "Garden", "Electronics", "Books", "Sports", "Other"],
        },
        condition:{
            type: String,
            required: true,
            enum: ["New", "Good", "Fair"],
        },
        pricePerDay:{
            type: Number,
            required: true,
            min: [0, "Price can not be negative"],
        },
        lender:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        area: {
            type: String,
            required: true, 
            trim: true
        },
        maxBorrowDays: {
            type: Number, min: 1
        },
        pickupNotes: {
            type: String,
            trim: true,
            maxlength: 300
        },
        rating: {
            type: Number,
            default: 0,
            max: 5,
            min: 0
        },
        ratingCount: {
            type: Number,
            default: 0,
            min: 0
        },
        isAvailable: { type: Boolean, default: true },
    
    }, { timestamps: true }
);

// keyword search on title and description
itemSchema.index({ title: 'text', description: 'text' });
// fast filtering for the browse page
itemSchema.index({ category: 1, city: 1, isAvailable: 1 });

module.exports = mongoose.model('Item', itemSchema);