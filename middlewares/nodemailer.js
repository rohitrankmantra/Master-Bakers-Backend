import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// 📧 Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAdminEmail = async (order) => {
  try {
    const deliveryCharge = 160;
    const grandTotal = order.totalAmount + deliveryCharge;

    const emailBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Bake Masters</h1>
          <p style="margin: 8px 0 0 0; color: #a0a0a0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Admin Notification - New Order</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 30px 25px;">
          
          <!-- Order Summary Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
            <div>
              <p style="margin: 0; color: #888; font-size: 11px; text-transform: uppercase; font-weight: 700;">Order ID</p>
              <p style="margin: 4px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #333; font-weight: 700;">${order._id}</p>
            </div>
            <div style="text-align: right;">
              <span style="background-color: #e6f7ef; color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #b3e6cd;">Paid</span>
            </div>
          </div>

          <!-- Customer & Address Grid -->
          <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
            <tr>
              <td width="50%" valign="top" style="padding-right: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #111; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Customer Info</h3>
                <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.5;">
                  <strong>${order.userInfo.name}</strong><br>
                  ${order.userInfo.phone}<br>
                  <a href="mailto:${order.userInfo.email}" style="color: #666; text-decoration: none;">${order.userInfo.email}</a>
                </p>
              </td>
              <td width="50%" valign="top" style="padding-left: 15px; border-left: 1px solid #f0f0f0;">
                <h3 style="margin: 0 0 10px 0; color: #111; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</h3>
                <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.5;">
                  ${order.userInfo.address}<br>
                  ${order.userInfo.city}, ${order.userInfo.state}<br>
                  ${order.userInfo.postalCode}
                </p>
              </td>
            </tr>
          </table>

          <!-- Items List -->
          <h3 style="margin: 0 0 15px 0; color: #111; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Items Ordered</h3>
          <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 6px; padding: 0 15px; margin-bottom: 25px;">
            ${order.items.map((item, index) => `
              <div style="display: flex; align-items: center; padding: 15px 0; ${index !== order.items.length - 1 ? 'border-bottom: 1px solid #f0f0f0;' : ''}">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover; margin-right: 15px; border: 1px solid #eee;">
                <div style="flex-grow: 1;">
                  <p style="margin: 0; font-weight: 600; color: #333; font-size: 13px; line-height: 1.4;">${item.name}</p>
                  <p style="margin: 4px 0 0 0; color: #888; font-size: 11px;">${item.quantity} x ₹${item.price}</p>
                </div>
                <div style="text-align: right; min-width: 80px;">
                  <p style="margin: 0; font-weight: 700; color: #111; font-size: 13px;">₹${item.price * item.quantity}</p>
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Calculation Summary -->
          <div style="margin-top: 20px; border-top: 2px solid #111; padding-top: 20px;">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="color: #666; font-size: 13px; padding-bottom: 8px;">Items Subtotal</td>
                <td style="text-align: right; color: #333; font-size: 13px; font-weight: 600; padding-bottom: 8px;">₹${order.totalAmount}</td>
              </tr>
              <tr>
                <td style="color: #666; font-size: 13px; padding-bottom: 15px;">Delivery Fee</td>
                <td style="text-align: right; color: #333; font-size: 13px; font-weight: 600; padding-bottom: 15px;">₹${deliveryCharge}</td>
              </tr>
              <tr>
                <td style="border-top: 1px dashed #ddd; padding-top: 15px; color: #111; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Received</td>
                <td style="border-top: 1px dashed #ddd; padding-top: 15px; text-align: right; color: #000; font-size: 22px; font-weight: 800;">₹${grandTotal}</td>
              </tr>
            </table>
          </div>

          <!-- Payment Info -->
          <div style="margin-top: 30px; background-color: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #eee; text-align: center;">
            <p style="margin: 0; color: #777; font-size: 11px; letter-spacing: 0.5px;">
              <strong>PAYMENT ID:</strong> <span style="font-family: monospace; color: #333;">${order.razorpayPaymentId}</span>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="padding: 25px; text-align: center; border-top: 1px solid #f0f0f0; background-color: #fafafa;">
          <p style="margin: 0; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">© 2026 Bake Masters | Notification System</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Bake Masters <noreply@bakemasters.in>",
      to: "vikasrankmantra@gmail.com",
      subject: `🧁 Order Received: ${order.userInfo.name} - ₹${grandTotal}`,
      html: emailBody,
    });

    return true;
  } catch (error) {
    console.error("Error sending admin email:", error);
    return false;
  }
};
