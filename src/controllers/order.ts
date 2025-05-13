import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { NewOrderRequestBody } from "../types/types.js";
// import { invalidateCache, reduceStock } from "../utils/features.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { MyCache } from "../app.js";

export const myOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { id: user } = req.query;

  const key = `my-orders-${user}`;

  let orders;

  // orders = await redis.get(key);
  orders = MyCache.has(key)
  if (orders) orders = JSON.parse(MyCache.get(key) as string);
  else {
    orders = await Order.find({ user });
    // await redis.setex(key, redisTTL, JSON.stringify(orders));
    MyCache.set(key, JSON.stringify(orders)); 
  }
  return res.status(200).json({
    success: true,
    orders,
  });
};

export const allOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const key = `all-orders`;

  let orders;

  orders = MyCache.has(key);

  if (orders) orders = JSON.parse(MyCache.get(key) as string);
  else {
    orders = await Order.find().populate("user", "name");
    // await redis.setex(key, redisTTL, JSON.stringify(orders));
    MyCache.set(key, JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    orders,
  });
};

export const getSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { id } = req.params;
  const key = `order-${id}`;

  let order;
  order = MyCache.has(key);

  if (order) order = MyCache.get(key) as string;
  else {
    order = await Order.findById(id).populate("user", "name");

    if (!order) {
      next(new ErrorHandler("Order Not Found", 404));
      return res.status(404).json({ success: false, message: "Order Not Found" });
    }

    MyCache.set(key, JSON.stringify(order));

    // await redis.setex(key, redisTTL, JSON.stringify(order));
  }
  return res.status(200).json({
    success: true,
    order,
  });
};



export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res: Response, next:NextFunction): Promise<Response> => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    // console.log(req.body);0

    // if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
    //   return next(new ErrorHandler("Please Enter All Fields", 400));

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);

export const processOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    next(new ErrorHandler("Order Not Found", 404));
    return res.status(404).json({ success: false, message: "Order Not Found" });
  }

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Processed Successfully",
  });
};

export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    next(new ErrorHandler("Order Not Found", 404));
    return res.status(404).json({ success: false, message: "Order Not Found" });
  }

  await order.deleteOne();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
};
