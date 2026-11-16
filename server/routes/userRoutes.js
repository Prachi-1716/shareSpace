const express = require("express");
const {updateMe, changePassword, getPublicProfile, getMyItems} = require("../controllers/userController");
const {protect} = require("../utils/middleware");
const router = express.Router();
const upload = require('../utils/cloudinary/upload');


router.get("/me", protect, (req, res)=>{
    res.json({
        success: true,
        user: req.user
    });
});

router.patch('/me', protect, upload.single('profilePhoto'), updateMe);
router.get("/me/items", protect, getMyItems);
router.patch('/me/password', protect, changePassword);
router.get("/:id", getPublicProfile);

module.exports = router