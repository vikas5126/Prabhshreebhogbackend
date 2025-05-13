import express from 'express';
import { connectDB } from './utils/features.js';
import NodeCache from 'node-cache';
import { errorMiddleware } from './middlewares/error.js';
import { config } from "dotenv";
import morgan from 'morgan';
import cors from 'cors';
// importing routes 
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import couponRoutes from './routes/payment.js';
import adminRoutes from './routes/stats.js';
import Razorpay from 'razorpay';
config({
    path: "./.env",
});
const port = process.env.PORT || 3000;
const app = express();
// app.use(cors({origin: 'https://frontend-wine-seven-22.vercel.app'}));
// app.use(cors({origin: 'http://localhost:5173'}));
app.use(cors());
app.use(express.json());
// const stripeKey = process.env.STRIPE_KEY || "";
// export const stripe = new Stripe(stripeKey);
export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET,
});
app.use(express.urlencoded({ extended: true }));
connectDB(process.env.uri);
export const MyCache = new NodeCache();
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", couponRoutes);
app.use("/api/v1/dashboard", adminRoutes);
app.get('/', (req, res) => {
    res.send('Welcome to the prabhshreebhog API!');
});
// 404 error handling middleware
app.use("/uploads", express.static("uploads"));
// app.use(errorMiddleware);
app.use(morgan("dev"));
// Error-handling middleware should be placed after all other middleware and routes
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
    console.error('Failed to start the server:', err.message);
});
// export default app;
