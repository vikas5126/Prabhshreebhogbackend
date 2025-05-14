import crypto from "crypto";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import { Payment } from "../models/payment.js";
import ErrorHandler from "../utils/utility-class.js";
import Razorpay from "razorpay";
// route: POST /api/razorpay/order
export const createRazorpayOrder = async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new ErrorHandler("Please enter amount", 400));
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_API_SECRET,
    });
    const order = await instance.orders.create({
        amount, // amount in paise
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
    });
    res.status(201).json({
        success: true,
        order,
    });
};
// route: POST /api/payment/verify
export const verifyRazorpayPayment = async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new ErrorHandler("Missing payment details", 400));
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body)
        .digest("hex");
    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
        await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });
        res.status(201).json({
            success: true,
            message: "Payment verified successfully",
        });
    }
    else {
        res.status(400).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};
export const newCoupon = async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount) {
        next(new ErrorHandler("Please enter both coupon and amount", 400));
        return res.status(400).json({ success: false, message: "Please enter both coupon and amount" });
    }
    await Coupon.create({ coupon, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created Successfully`,
    });
};
export const applyDiscount = async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ coupon });
    if (!discount) {
        next(new ErrorHandler("Invalid Coupon Code", 400));
        return res.status(400).json({ success: false, message: "Invalid Coupon Code" });
    }
    return res.status(200).json({
        success: true,
        discount: discount.amount,
    });
};
export const allCoupons = async (req, res, next) => {
    const coupons = await Coupon.find({});
    return res.status(200).json({
        success: true,
        coupons,
    });
};
export const getCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: "Coupon not found" });
            return;
        }
        res.status(200).json(coupon);
    }
    catch (error) {
        next(error);
    }
};
export const updateCoupon = async (req, res, next) => {
    const { id } = req.params;
    const { coupon, amount } = req.body;
    const code = await Coupon.findById(id);
    if (!code) {
        next(new ErrorHandler("Invalid Coupon ID", 400));
        return res.status(400).json({ success: false, message: "Invalid Coupon ID" });
    }
    if (coupon)
        code.coupon = coupon;
    if (amount)
        code.amount = amount;
    await coupon.save();
    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon.code} Updated Successfully`,
    });
};
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon)
        return next(new ErrorHandler("Invalid Coupon ID", 400));
    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon.coupon} Deleted Successfully`,
    });
});
