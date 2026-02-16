import express from "express";
import {
  sendOTP,
  verifyOTP,
  sendForgotPasswordOTP,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// OTP for signup
router.post("/send-otp", sendOTP);              // Send OTP for email verification
router.post("/verify-otp", verifyOTP);          // Verify OTP for signup

// OTP for forgot password
router.post("/forgot-password", sendForgotPasswordOTP);  // Send OTP for password reset
router.post("/reset-password", resetPassword);           // Verify OTP and reset password

export default router;
