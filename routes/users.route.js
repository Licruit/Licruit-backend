const express = require("express");
const router = express.Router();
const authController = require("../controllers/users.controller");

router.post("/auth/otp", authController.postOtp);
router.post("/auth/otp/validation", authController.verifyOtp);

module.exports = router;