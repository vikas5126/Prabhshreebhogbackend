import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { newProduct, getlatestProducts, getAllCategories , getAdminProducts, getSingleProduct, getAllProducts, updateProduct, deleteProduct, getProductByCategories } from "../controllers/product.js";
const app = express.Router();

//To Create New Product  - /api/v1/product/new
app.post("/new", adminOnly, singleUpload,(req, res, next) => {
  newProduct(req, res, next).catch(next);
});

app.get("/latest", (req, res, next) => {
  getlatestProducts(req, res, next).catch(next);
});

//To get all unique Categories  - /api/v1/product/categories
app.get("/categories", (req, res, next) => {
  getAllCategories(req, res, next).catch(next);
});

//To get all Products with filters  - /api/v1/product/all
app.get("/all", (req, res, next) => {
  getAllProducts(req, res, next).catch(next);
});

//To get all Products   - /api/v1/product/admin-products
app.get("/admin-products", adminOnly, (req, res, next) => {
  getAdminProducts(req, res, next).catch(next);
});

app.get("/collection/:category", (req, res, next) => {
  getProductByCategories(req, res, next).catch(next);
})

// To get, update, delete Product
app
  .route("/:id")
  .get( (req, res, next) => {
  getSingleProduct(req, res, next).catch(next);
})
  .put(adminOnly, singleUpload, (req, res, next) => {
  updateProduct(req, res, next).catch(next);
})
  .delete(adminOnly, (req, res, next) => {
  deleteProduct(req, res, next).catch(next);
});

export default app;