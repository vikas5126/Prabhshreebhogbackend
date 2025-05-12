import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allCoupons, applyDiscount, createRazorpayOrder, 
//   createPaymentIntent,
deleteCoupon, getCoupon, newCoupon, updateCoupon, verifyRazorpayPayment, } from "../controllers/payment.js";
const app = express.Router();
// route - /api/v1/payment/create
app.post("/create", createRazorpayOrder);
app.post("/verify", verifyRazorpayPayment);
// route - /api/v1/payment/coupon/new
app.get("/discount", applyDiscount);
// route - /api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, newCoupon);
// route - /api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly, allCoupons);
// route - /api/v1/payment/coupon/:id
app
    .route("/coupon/:id")
    .get(adminOnly, getCoupon)
    .put(adminOnly, updateCoupon)
    .delete(adminOnly, deleteCoupon);
export default app;
