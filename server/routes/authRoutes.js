const express = require("express");
const {register, login, updateMe, changePassword,verifyOtp, resendOtp} = require("../controllers/authController");
const {protect} = require("../utils/middleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get("/me", protect, (req, res)=>{
    res.json({
        success: true,
        user: req.user
    });
});

router.patch('/me', updateMe);
router.patch('/me/password', changePassword);



module.exports = router;