const Item = require('../models/Items');
const asyncWrap = require('../utils/asyncWrap');
const ExpressError = require('../utils/ExpressError');
const uploadToCloudinary = require('../utils/cloudinary/uploadToCloudinary');
const cloudinary = require('../utils/cloudinary/cloudinary');
const mongoose = require('mongoose');
//Create Item


exports.createItem = asyncWrap(async (req, res) => {
  const {
    title,
    description,
    category,
    condition,
    pricePerDay,
    city,
    area,
    maxBorrowDays,
    pickupNotes
  } = req.body;

  // Check uploaded images
  if (!req.files || req.files.length === 0) {
    throw new ExpressError(400, 'At least one image is required');
  }

  if (req.files.length > 5) {
    throw new ExpressError(400, 'Up to 5 images are allowed');
  }

  // Upload images to Cloudinary
  const results = await Promise.all(
    req.files.map(file =>
      uploadToCloudinary(file.buffer, 'sharespace/items')
    )
  );

  // Extract image URLs and public IDs
  const imageUrls = results.map(result => result.secure_url);
  const imagePublicIds = results.map(result => result.public_id);

  // Create item
  const item = await Item.create({
    title,
    description,
    category,
    condition,
    pricePerDay,
    city,
    area,
    maxBorrowDays,
    pickupNotes,
    images: imageUrls,
    imagePublicIds,
    lender: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Item listed successfully',
    item
  });
});




//This controller handles the ShareSpace browse page, where users can explore available items and narrow down results.
exports.getItems = asyncWrap(async (req, res) => {
  const {
    search,
    category,
    city,
    isAvailable
  } = req.query;

  // Build query dynamically
  const filter = {};

  // Keyword search
  if (search && search.trim()) {
    const safeSearch = search.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // City filter
  if (city) {
    filter.city = {
      $regex: `^${city.trim()}$`,
      $options: 'i'
    };
  }

  // Availability filter
  if (isAvailable !== undefined) {
    if (!['true', 'false'].includes(isAvailable)) {
      throw new ExpressError(400, 'Invalid availability value');
    }

    filter.isAvailable = isAvailable === 'true';
  }

  // Pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  const skip = (page - 1) * limit;

  // Fetch items and total count
  const [items, totalItems] = await Promise.all([
    Item.find(filter)
      .populate('lender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Item.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: items.length,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    items
  });
});


//get the Item
exports.getItem = asyncWrap(async (req, res) => {

  const { id } = req.params;

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, 'Invalid item ID');
  }

  // Find item and populate lender details
  const item = await Item.findById(id)
    .populate('lender', 'name city profilePhoto');

  // Check if item exists
  if (!item) {
    throw new ExpressError(404, 'Item not found');
  }

  res.status(200).json({
    success: true,
    item
  });

});


const UPDATE_FIELDS = [
  'title',
  'description',
  'category',
  'condition',
  'pricePerDay',
  'city',
  'area',
  'maxBorrowDays',
  'pickupNotes',
  'isAvailable'
];

exports.updateItem = asyncWrap(async (req, res) => {
  const { id } = req.params;

  // Validate item ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, 'Invalid item ID');
  }

  // Find item
  const item = await Item.findById(id);

  if (!item) {
    throw new ExpressError(404, 'Item not found');
  }

  // Check ownership
  if (item.lender.toString() !== req.user._id.toString()) {
    throw new ExpressError(403, 'You cannot update someone else\'s item');
  }

  // Pick only allowed fields
  const updates = {};

  UPDATE_FIELDS.forEach((key) => {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new ExpressError(400, 'No valid fields provided for update');
  }

  // Update item
  Object.assign(item, updates);

  await item.save();

  res.status(200).json({
    success: true,
    message: 'Item updated successfully',
    item
  });
});

// Delete the item
exports.deleteItem = asyncWrap(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, 'Invalid item ID');
  }

  // Find item
  const item = await Item.findById(id);

  if (!item) {
    throw new ExpressError(404, 'Item not found');
  }

  // Verify ownership
  if (item.lender.toString() !== req.user._id.toString()) {
    throw new ExpressError(
      403,
      'You cannot delete someone else\'s item'
    );
  }

  // Delete item from database
  await Item.findByIdAndDelete(id);

  // Delete images from Cloudinary
  if (item.imagePublicIds?.length) {
    const results = await Promise.allSettled(
      item.imagePublicIds.map(publicId =>
        cloudinary.uploader.destroy(publicId)
      )
    );

    const failedDeletes = results.filter(
      result => result.status === 'rejected'
    );

    if (failedDeletes.length) {
      console.error('Some Cloudinary images could not be deleted');
    }
  }

  res.status(200).json({
    success: true,
    message: 'Item deleted successfully'
  });
});
