import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";
import users from "../Modals/Auth.js";
import mongoose from "mongoose";

// ─── Plan configuration ────────────────────────────────────────────────────────
const PLAN_CONFIG = {
    bronze: { amount: 1000, label: "Bronze", watchMinutes: 7 },
    silver: { amount: 5000, label: "Silver", watchMinutes: 10 },
    gold: { amount: 10000, label: "Gold", watchMinutes: "Unlimited" },
};

// ─── Lazy Razorpay init ────────────────────────────────────────────────────────
const getRazorpay = () =>
    new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

// ─── Nodemailer transporter ────────────────────────────────────────────────────
const getTransporter = () =>
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
        },
    });

// ─── Send Invoice Email ────────────────────────────────────────────────────────
const sendInvoiceEmail = async ({ to, name, plan, amount, paymentId }) => {
    const planInfo = PLAN_CONFIG[plan];
    const transporter = getTransporter();
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#FF6B35,#FF0000);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;">🎬 YourTube</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Subscription Invoice</p>
        </div>
        <!-- Body -->
        <div style="padding:32px 24px;">
          <p style="font-size:16px;color:#333;">Hi <strong>${name}</strong>,</p>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            Thank you for upgrading to the <strong>${planInfo.label} Plan</strong> on YourTube!
            Your payment was successful and your plan is now active.
          </p>
          <!-- Invoice box -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0;">
            <h3 style="margin:0 0 16px;color:#1a202c;font-size:15px;">Invoice Details</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="color:#64748b;padding:6px 0;">Plan</td><td style="text-align:right;color:#1a202c;font-weight:600;">${planInfo.label}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Amount Paid</td><td style="text-align:right;color:#1a202c;font-weight:600;">₹${amount / 100}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Watch Limit</td><td style="text-align:right;color:#1a202c;font-weight:600;">${planInfo.watchMinutes === "Unlimited" ? "Unlimited ♾️" : planInfo.watchMinutes + " minutes"}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Payment ID</td><td style="text-align:right;color:#1a202c;font-family:monospace;font-size:12px;">${paymentId}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Date</td><td style="text-align:right;color:#1a202c;">${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</td></tr>
            </table>
          </div>
          <p style="color:#555;font-size:13px;line-height:1.6;">
            Enjoy your upgraded YourTube experience! 🎉
          </p>
        </div>
        <!-- Footer -->
        <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 YourTube · This is a test transaction</p>
        </div>
      </div>
    </body>
    </html>
  `;
    await transporter.sendMail({
        from: `"YourTube" <${process.env.NODEMAILER_USER}>`,
        to,
        subject: `✅ YourTube ${planInfo.label} Plan Activated — Invoice`,
        html,
    });
};

// ─── Create Order ──────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
    const body = req.body || {};
    const plan = body.plan || "gold";
    const planInfo = PLAN_CONFIG[plan];
    if (!planInfo) {
        return res.status(400).json({ message: "Invalid plan selected" });
    }
    try {
        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
            amount: planInfo.amount,
            currency: "INR",
            receipt: `receipt_${plan}_${Date.now()}`,
            notes: { plan },
        });
        return res.status(200).json({ ...order, plan });
    } catch (error) {
        console.error("Razorpay create order error:", error);
        return res.status(500).json({ message: "Could not create payment order" });
    }
};

// ─── Verify Payment & Upgrade Plan ────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
    const body = req.body || {};
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;
    const plan = body.plan || "gold";

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user" });
    }
    const planInfo = PLAN_CONFIG[plan];
    if (!planInfo) {
        return res.status(400).json({ message: "Invalid plan" });
    }

    try {
        // Verify HMAC signature
        const hmacBody = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(hmacBody)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // Upgrade user plan
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            { $set: { plan } },
            { new: true }
        );

        // Send invoice email (non-blocking)
        if (updatedUser?.email && process.env.NODEMAILER_USER && process.env.NODEMAILER_PASS) {
            sendInvoiceEmail({
                to: updatedUser.email,
                name: updatedUser.name || "there",
                plan,
                amount: planInfo.amount,
                paymentId: razorpay_payment_id,
            }).catch((err) => console.error("Email send failed:", err));
        }

        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Payment verify error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
