import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["signup", "forgot-password"],
      default: "signup",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
      index: { expires: 0 }, // TTL index for automatic deletion
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
