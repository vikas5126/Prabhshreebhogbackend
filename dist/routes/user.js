import express from "express";
import { deleteUser, getAllUsers, getUser, newUser, } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express.Router();
// route - /api/v1/user/new
app.post("/new", (req, res, next) => {
    newUser(req, res, next).catch(next);
});
// Route - /api/v1/user/all
app.get("/all", adminOnly, (req, res, next) => {
    getAllUsers(req, res, next).catch(next);
});
// Route - /api/v1/user/dynamicID
app.route("/:id").get((req, res, next) => {
    getUser(req, res, next).catch(next);
}).delete(adminOnly, (req, res, next) => {
    deleteUser(req, res, next).catch(next);
});
export default app;
