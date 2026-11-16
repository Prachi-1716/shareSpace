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

router.get("/me/items", protect, getMyItems);
router.get("/me/:id", getPublicProfile);


router.patch('/me', protect, upload.single('profilePhoto'), updateMe);
router.patch('/me/password', protect, changePassword);


module.exports = router