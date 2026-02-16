import dotenv from "dotenv";
import OTP from "../models/OTP.js";
import { sendOTPEmail, generateOTP } from "../middlewares/mailer.js";

dotenv.config();

/**
 * Send OTP for Email Verification
 */
export const sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res
        .status(400)
        .json({ message: "Email and name are required" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      purpose: "signup",
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, name);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({ ok: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Verify OTP for Email Verification
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP are required" });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP" });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res
        .status(400)
        .json({ message: "OTP has expired" });
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({ ok: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Send OTP for Forgot Password
 */
export const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      purpose: "forgot-password",
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, "User");

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({ ok: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send forgot password OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Reset Password with OTP
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: "forgot-password",
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Note: Password reset should be handled by the frontend (auth-context)
    // since passwords are managed there. Return OK so frontend can update localStorage

    return res.status(200).json({
      ok: true,
      message: "OTP verified. You can now reset your password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
