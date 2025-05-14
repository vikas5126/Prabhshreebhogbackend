import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { Request, Response, NextFunction } from "express";
import {
  allCoupons,
  applyDiscount,
  createRazorpayOrder,
//   createPaymentIntent,
  deleteCoupon,
  getCoupon,
  newCoupon,
  updateCoupon,
  verifyRazorpayPayment,
} from "../controllers/payment.js";

const app = express.Router();

// route - /api/v1/payment/create
app.post("/create", createRazorpayOrder);

app.post("/verify", verifyRazorpayPayment)

// route - /api/v1/payment/coupon/new
app.get("/discount", (req, res, next) => {
  applyDiscount(req, res, next).catch(next);
});

// route - /api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, (req, res, next) => {
  newCoupon(req, res, next).catch(next);
});

// route - /api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly, (req, res, next) => {
  allCoupons(req, res, next).catch(next);
});

// route - /api/v1/payment/coupon/:id
app
  .route("/coupon/:id")
  .get(adminOnly, getCoupon)
  .put(adminOnly, (req, res, next) => {
    updateCoupon(req, res, next).catch(next);
  })
  .delete(adminOnly, (req, res, next) => {
    deleteCoupon(req, res, next).catch(next);
  });

export default app;
