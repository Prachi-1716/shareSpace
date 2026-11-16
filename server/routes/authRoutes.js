const express = require("express");
const {register, login,verifyOtp, resendOtp, logout} = require("../controllers/authController");
const {protect} = require("../utils/middleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/logout', logout);



module.exports = router;