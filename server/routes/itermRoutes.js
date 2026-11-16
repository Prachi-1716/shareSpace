const express = require('express');
const { createItem, getItems, getItem, updateItem,  deleteItem} = require('../controllers/itemController');
const { protect } = require('../utils/middleware');
const upload = require('../utils/cloudinary/upload');

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', protect, upload.array('images', 5), createItem);
router.patch('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);


module.exports = router;