import { Request, Response, NextFunction } from "express";
import { Coupon } from "../models/coupon.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";
import { OrderItemType, ShippingInfoType } from "../types/types.js";
import { Product } from "../models/product.js";
import { stripe } from "../app.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  // const { id } = req.query;

  const {amount} = req.body;

  if(!amount) return next(new ErrorHandler("Please enter amount", 400));

  // const user = await User.findById(id).select("name");

  // if (!user) return next(new ErrorHandler("Please login first", 401));

  // const {
  //   items,
  //   shippingInfo,
  //   coupon,
  // }: {
  //   items: OrderItemType[];
  //   shippingInfo: ShippingInfoType | undefined;
  //   coupon: string | undefined;
  // } = req.body;

  // if (!items) return next(new ErrorHandler("Please send items", 400));

  // if (!shippingInfo)
  //   return next(new ErrorHandler("Please send shipping info", 400));

  // let discountAmount = 0;

  // if (coupon) {
  //   const discount = await Coupon.findOne({ coupon });
  //   if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));
  //   discountAmount = discount.amount;
  // }

  // const productIDs = items.map((item) => item.productId);

  // const products = await Product.find({
  //   _id: { $in: productIDs },
  // });

  // const subtotal = products.reduce((prev, curr) => {
  //   const item = items.find((i) => i.productId === curr._id.toString());
  //   if (!item) return prev;
  //   return curr.price * item.quantity + prev;
  // }, 0);

  // const tax = subtotal * 0.18;

  // const shipping = subtotal > 1000 ? 0 : 200;

  // const total = Math.floor(subtotal + shipping - discountAmount);

  const paymentIntent = await stripe.paymentIntents.create({
    // amount: total * 100,
    amount:amount,
    currency: "inr",
    // description: "MERN-Ecommerce",
    // shipping: {
    //   name: user.name,
    //   address: {
    //     line1: shippingInfo.address,
    //     postal_code: shippingInfo.pinCode.toString(),
    //     city: shippingInfo.city,
    //     state: shippingInfo.state,
    //     country: shippingInfo.country,
    //   },
    // },
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});


export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
  
    if (!coupon || !amount)
      return next(new ErrorHandler("Please enter both coupon and amount", 400));
  
    await Coupon.create({ coupon, amount });
  
    return res.status(201).json({
      success: true,
      message: `Coupon ${coupon} Created Successfully`,
    });
  });
  
  export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
  
    const discount = await Coupon.findOne({ coupon });
  
    if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));
  
    return res.status(200).json({
      success: true,
      discount: discount.amount,
    });
  });
  
  export const allCoupons = TryCatch(async (req, res, next) => {
    const coupons = await Coupon.find({});
  
    return res.status(200).json({
      success: true,
      coupons,
    });
  });
  
  export const getCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const coupon = await Coupon.findById(id);
  
    if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));
  
    return res.status(200).json({
      success: true,
      coupon,
    });
  });
  
  export const updateCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const { coupon, amount } = req.body;
  
    const code = await Coupon.findById(id);
  
    if (!code) return next(new ErrorHandler("Invalid Coupon ID", 400));
  
    if (coupon) code.coupon = coupon;
    if (amount) code.amount = amount;
  
    await coupon.save();
  
    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} Updated Successfully`,
    });
  });
  
  export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const coupon = await Coupon.findByIdAndDelete(id);
  
    if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));
  
    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.coupon} Deleted Successfully`,
    });
  });
  