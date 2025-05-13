import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder, } from "../controllers/order.js";
const app = express.Router();
// route - /api/v1/order/new
app.post("/new", (req, res, next) => {
    newOrder(req, res, next).catch(next);
});
// route - /api/v1/order/my
app.get("/my", (req, res, next) => {
    myOrders(req, res, next).catch(next);
});
// route - /api/v1/order/my
app.get("/all", adminOnly, (req, res, next) => {
    allOrders(req, res, next).catch(next);
});
app
    .route("/:id")
    .get((req, res, next) => {
    getSingleOrder(req, res, next).catch(next);
})
    .put(adminOnly, (req, res, next) => {
    processOrder(req, res, next).catch(next);
})
    .delete(adminOnly, (req, res, next) => {
    deleteOrder(req, res, next).catch(next);
});
export default app;
