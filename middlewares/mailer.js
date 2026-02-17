import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

// 📧 Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 🔒 Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 📧 Send OTP via email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 0; border-radius: 12px; overflow: hidden;">
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 1px;">🧁 BakeMasters</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Freshly Baked Goodness</p>
        </div>

        <!-- Main content -->
        <div style="background: white; padding: 40px 30px;">
          <h2 style="color: #7C3AED; margin: 0 0 10px 0; font-size: 24px;">Welcome to BakeMasters!</h2>
          <p style="color: #666; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          
          <p style="color: #555; margin: 0 0 30px 0; font-size: 14px; line-height: 1.6;">
            Thank you for joining us! We're thrilled to have you as part of our BakeMasters family. To complete your email verification and unlock all the delicious treats we have to offer, please use the verification code below:
          </p>

          <!-- OTP Box -->
          <div style="background: linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%); padding: 30px; border-radius: 10px; text-align: center; border: 2px solid #7C3AED; margin: 0 0 30px 0;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
            <p style="margin: 0; font-size: 42px; font-weight: 800; color: #7C3AED; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
          </div>

          <!-- Info section -->
          <div style="background: #FFF9E6; padding: 15px; border-left: 4px solid #F59E0B; border-radius: 6px; margin: 0 0 30px 0;">
            <p style="color: #92400E; margin: 0; font-size: 13px;"><strong>⏱️ Note:</strong> This code is valid for 10 minutes. Please don't share this code with anyone for security reasons.</p>
          </div>

          <!-- Footer text -->
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            If you didn't create this account, please ignore this email or <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #7C3AED; text-decoration: none; font-weight: 600;">contact us</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #F9FAFB; padding: 20px; text-align: center; color: #999; font-size: 11px;">
          <p style="margin: 0;">© 2026 BakeMasters. All rights reserved. | <a href="https://bakemasters.com" style="color: #7C3AED; text-decoration: none;">Visit Website</a></p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Bake Masters <noreply@bakemasters.in>",
      to: email,
      subject: "🧁 Verify Your BakeMasters Account - Code Inside",
      html: emailBody,
    });
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

// 📧 Send admin email for new order
export const sendAdminEmail = async (order) => {
  try {
    const itemsList = order.items
      .map(
        (item, index) =>
          `<tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 12px; border-right: 1px solid #E5E7EB;">${item.name}</td>
        <td style="padding: 12px; text-align: center; border-right: 1px solid #E5E7EB;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-right: 1px solid #E5E7EB;">₹${item.price}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #7C3AED;">₹${
            item.price * item.quantity
          }</td>
      </tr>`
      )
      .join("");

    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); padding: 40px 20px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🧁 New Order Received!</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">A delicious order is waiting to be prepared</p>
        </div>

        <!-- Main content -->
        <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
          
          <!-- Order ID Alert -->
          <div style="background: #F0F9FF; border-left: 4px solid #7C3AED; padding: 16px; border-radius: 6px; margin-bottom: 25px;">
            <p style="margin: 0; color: #1E40AF; font-weight: 600; font-size: 16;">Order ID: <span style="font-family: monospace; background: white; padding: 2px 6px; border-radius: 4px;">${order._id}</span></p>
          </div>

          <!-- Customer Section -->
          <h2 style="color: #7C3AED; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">📋 Customer Information</h2>
          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #FCD34D;">
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Name:</strong> ${order.userInfo.name}</p>
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${order.userInfo.email}" style="color: #7C3AED; text-decoration: none;">${order.userInfo.email}</a></p>
            <p style="margin: 8px 0; color: #333; font-size: 14px;"><strong>Phone:</strong> ${order.userInfo.phone}</p>
          </div>

          <!-- Delivery Address Section -->
          <h2 style="color: #7C3AED; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">📍 Delivery Address</h2>
          <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #10B981;">
            <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
              ${order.userInfo.address}<br>
              ${order.userInfo.city}, ${order.userInfo.state} ${order.userInfo.postalCode}<br>
              ${order.userInfo.country || 'India'}
            </p>
          </div>

          <!-- Items Section -->
          <h2 style="color: #7C3AED; font-size: 16px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">🛒 Items Ordered</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); color: white;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Quantity</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Unit Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <!-- Payment Section -->
          <div style="background: linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%); padding: 20px; border-radius: 8px; border: 2px solid #7C3AED; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; font-weight: 600; color: #333;">Order Total:</span>
              <span style="font-size: 28px; font-weight: 800; color: #7C3AED;">₹${order.totalAmount}</span>
            </div>
            <hr style="border: none; border-top: 1px solid #D8BFD8; margin: 15px 0;">
            <p style="margin: 0; color: #666; font-size: 13px;"><strong>Payment Status:</strong> <span style="background: #ECF0F1; padding: 4px 8px; border-radius: 4px; color: #27AE60; font-weight: 600;">${order.paymentStatus}</span></p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${process.env.ADMIN_PANEL_URL || '#'}" style="background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 14px;">View Order Details</a>
          </div>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #F9FAFB; padding: 20px; text-align: center; color: #999; font-size: 11px; border-radius: 0 0 12px 12px; border: 1px solid #E5E7EB; border-top: none;">
          <p style="margin: 0;">© 2026 BakeMasters Admin Portal</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Bake Masters <noreply@bakemasters.in>",
      to: "rohitrankmantra12@gmail.com",
      subject: `🧁 New Order Received - ${order._id}`,
      html: emailBody,
    });
    return true;
  } catch (error) {
    console.error("Error sending admin email:", error);
    return false;
  }
};

export default { sendOTPEmail, sendAdminEmail, generateOTP };
