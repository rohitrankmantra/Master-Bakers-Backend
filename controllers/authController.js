import dotenv from "dotenv";
import bcrypt from "bcrypt";
import OTP from "../models/OTP.js";
import User from "../models/User.js";
import { sendOTPEmail, generateOTP } from "../middlewares/mailer.js";

dotenv.config();

const SALT_ROUNDS = 10;

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

    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otp, SALT_ROUNDS);

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP (hashed)
    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      purpose: "signup",
    });

    // Send OTP via email (send plain OTP to user)
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

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
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

    // Compare provided OTP with hashed OTP using bcrypt
    const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isOTPValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP" });
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

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Forgot Password - Looking for user with email:", normalizedEmail);

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    console.log("User found:", user ? "YES" : "NO");

    if (!user) {
      return res.status(404).json({ 
        ok: false,
        message: "No account found with this email address." 
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otp, SALT_ROUNDS);

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Save new OTP (hashed)
    await OTP.create({
      email: normalizedEmail,
      otp: hashedOTP,
      purpose: "forgot-password",
    });

    // Send OTP via email (send plain OTP to user)
    const emailSent = await sendOTPEmail(email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({ ok: true, message: "OTP sent successfully to your email" });
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

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
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

    // Compare provided OTP with hashed OTP using bcrypt
    const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isOTPValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Hash new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password in database
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.passwordHash = hashedPassword;
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * User Signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Signup - Creating user with email:", normalizedEmail);

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      isEmailVerified: false,
    });

    console.log("User created successfully:", newUser._id);

    return res.status(201).json({
      ok: true,
      message: "User created successfully. Please verify your email.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * User Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Login attempt - Email:", normalizedEmail);

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log("Login failed - User not found for email:", normalizedEmail);
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password.",
      });
    }

    console.log("User found, checking password...");

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      console.log("Login failed - Invalid password");
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password.",
      });
    }

    console.log("Login successful for user:", user._id);

    return res.status(200).json({
      ok: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark Email as Verified
 */
export const markEmailVerified = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Mark email verified error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Debug - Check if user exists by email
 */
export const debugCheckUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Debug - Looking for user with email:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("Debug - User NOT found");
      return res.status(200).json({
        found: false,
        message: "User not found in database",
      });
    }

    console.log("Debug - User found:", user._id);
    return res.status(200).json({
      found: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
