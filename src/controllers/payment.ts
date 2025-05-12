import crypto from "crypto";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import { Payment } from "../models/payment.js";
import ErrorHandler from "../utils/utility-class.js";
import Razorpay from "razorpay";

// export const createPaymentIntent = TryCatch(async (req, res, next) => {
//   // const { id } = req.query;

//   const {amount} = req.body;

//   if(!amount) return next(new ErrorHandler("Please enter amount", 400));

//   // const user = await User.findById(id).select("name");

//   // if (!user) return next(new ErrorHandler("Please login first", 401));

//   // const {
//   //   items,
//   //   shippingInfo,
//   //   coupon,
//   // }: {
//   //   items: OrderItemType[];
//   //   shippingInfo: ShippingInfoType | undefined;
//   //   coupon: string | undefined;
//   // } = req.body;

//   // if (!items) return next(new ErrorHandler("Please send items", 400));

//   // if (!shippingInfo)
//   //   return next(new ErrorHandler("Please send shipping info", 400));

//   // let discountAmount = 0;

//   // if (coupon) {
//   //   const discount = await Coupon.findOne({ coupon });
//   //   if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));
//   //   discountAmount = discount.amount;
//   // }

//   // const productIDs = items.map((item) => item.productId);

//   // const products = await Product.find({
//   //   _id: { $in: productIDs },
//   // });

//   // const subtotal = products.reduce((prev, curr) => {
//   //   const item = items.find((i) => i.productId === curr._id.toString());
//   //   if (!item) return prev;
//   //   return curr.price * item.quantity + prev;
//   // }, 0);

//   // const tax = subtotal * 0.18;

//   // const shipping = subtotal > 1000 ? 0 : 200;

//   // const total = Math.floor(subtotal + shipping - discountAmount);

//   const paymentIntent = await stripe.paymentIntents.create({
//     // amount: total * 100,
//     amount:amount,
//     currency: "inr",
//     // description: "MERN-Ecommerce",
//     // shipping: {
//     //   name: user.name,
//     //   address: {
//     //     line1: shippingInfo.address,
//     //     postal_code: shippingInfo.pinCode.toString(),
//     //     city: shippingInfo.city,
//     //     state: shippingInfo.state,
//     //     country: shippingInfo.country,
//     //   },
//     // },
//   });

//   return res.status(201).json({
//     success: true,
//     clientSecret: paymentIntent.client_secret,
//   });
// });

// 

// route: POST /api/razorpay/order
export const createRazorpayOrder = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new ErrorHandler("Please enter amount", 400));

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY!,
    key_secret: process.env.RAZORPAY_API_SECRET!,
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
});


// route: POST /api/payment/verify
export const verifyRazorpayPayment = TryCatch(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new ErrorHandler("Missing payment details", 400));
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET!)
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
  } else {
    res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }
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
  
