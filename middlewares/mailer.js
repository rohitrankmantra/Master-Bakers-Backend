import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// 📧 Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

// 🔒 Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 📧 Send OTP via email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Your OTP for BakeMasters Account Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h1 style="color: #7C3AED; text-align: center;">BakeMasters</h1>
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            
            <p style="color: #666; font-size: 16px;">Hi <strong>${name}</strong>,</p>
            
            <p style="color: #666; font-size: 14px;">
              Thank you for signing up! To verify your email address, please use the following code:
            </p>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #7C3AED; letter-spacing: 5px;">${otp}</p>
            </div>
            
            <p style="color: #999; font-size: 12px;">
              This code will expire in 10 minutes. Do not share this code with anyone.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't request this email, please ignore it.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
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
        (item) =>
          `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${
            item.price * item.quantity
          }</td>
      </tr>`
      )
      .join("");

      
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received - Order ID: ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">New Order from BakeMasters</h1>
          
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Customer:</strong> ${order.userInfo.name}</p>
          <p><strong>Email:</strong> ${order.userInfo.email}</p>
          <p><strong>Phone:</strong> ${order.userInfo.phone}</p>
          
          <h3>Delivery Address:</h3>
          <p>${order.userInfo.address}, ${order.userInfo.city}, ${order.userInfo.state} ${order.userInfo.postalCode}</p>
          
          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Qty</th>
                <th style="padding: 10px; text-align: left;">Price</th>
                <th style="padding: 10px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          
          <h3 style="margin-top: 20px;">Order Total: ₹${order.totalAmount}</h3>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending admin email:", error);
    return false;
  }
};

export default { sendOTPEmail, sendAdminEmail, generateOTP };
