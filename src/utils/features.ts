import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { MyCache } from "../app.js";
import { Order } from "../models/order.js";

export const connectDB = (uri: string) => {
    // mongoose
    //   .connect(uri, {
    //     dbName: "Ecommerce_24",
    //   })
    //   .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    //   .catch((e) => console.log(e));

    mongoose.connect(`mongodb+srv://Rahul_Jha:${process.env.db_password}@cluster0.o0cfg.mongodb.net/Prahashreebhog?retryWrites=true&w=majority`)
    .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    .catch((e) => console.log(e));

  };


  export const reduceStock = async (orderItems: OrderItemType[]) => {
    for (let i = 0; i < orderItems.length; i++) {
      const order = orderItems[i];
      const product = await Product.findById(order.productId);
      if (!product) throw new Error("Product Not Found");
      product.stock -= order.quantity;
      await product.save();
    }
  };

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = ["latestProducts", "categories", "all-products"];

    const products = await Product.find({}).select("_id");
    products.forEach((product) => {
      productKeys.push(`product-${product._id}`);
    });

    MyCache.del(productKeys);
  }
  if (order) {
    const orderKeys: string[] = ["all-orders", `my-orders-${userId}`, `order-${orderId}`];

    // const orders = await Order.find({}).select("_id");
    // orders.forEach((order) => {
    //   orderKeys.push(`order-${order._id}`);
    // });

    MyCache.del(orderKeys);
  }
  if (admin) {
    // Invalidate admin cache
  }
}


export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

export const getInventories = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    });
  });

  return categoryCount;
};

export default interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}
type FuncProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: FuncProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });

  return data;
};
