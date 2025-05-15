import express from "express";
import {
  deleteUser,
  getAllUsers,
  // getCartItems,
  getUser,
  newUser,
  // setCartItems,
} from "../controllers/user.js";
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
app.route("/:id").get( (req, res, next) => {
  getUser(req, res, next).catch(next);
}).delete(adminOnly, (req, res, next) => {
  deleteUser(req, res, next).catch(next);
});


// app.put("/cart", isAuthenticated, (req, res, next) => {
//   setCartItems(req, res, next).catch(next);
// });

// app.get("/cartDetails", isAuthenticated, async (req, res, next) => {
//   try {
//     await getCartItems(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// });

export default app;
