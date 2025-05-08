import { Product } from "../models/product.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { invalidateCache } from "../utils/features.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category, description, star, tag, sale, numOfReviews } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("Please add Photo", 400));
    // if (photo.length < 1)
    //   return next(new ErrorHandler("Please add atleast one Photo", 400));
    // if (photo.length > 5)
    //   return next(new ErrorHandler("You can only upload 5 Photos", 400));
    if (!name || !price || !stock || !category || !description) {
        rm(photo.path, () => {
            console.log("File Deleted");
        });
        return next(new ErrorHandler("Please enter All Fields", 400));
    }
    // Upload Here
    // const photosURL = await uploadToCloudinary(photos);
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo.path,
        description,
        star,
        sale,
        tag,
        // mrp,
        numOfReviews
    });
    await invalidateCache({ product: true, admin: true });
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
    });
});
export const getlatestProducts = TryCatch(async (req, res, next) => {
    let products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    ;
    return res.status(200).json({
        success: true,
        products,
    });
});
// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories = await Product.distinct("category");
    return res.status(200).json({
        success: true,
        categories,
    });
});
export const getProductByCategories = TryCatch(async (req, res, next) => {
    const { category } = req.params;
    const products = await Product.find({ category });
    return res.status(200).json({
        success: true,
        products
    });
});
// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = TryCatch(async (req, res, next) => {
    let products = await Product.find({});
    return res.status(200).json({
        success: true,
        products,
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    // const key = `product-${id}`;
    console.log(id);
    let product = await Product.findById(id);
    console.log(product);
    return res.status(200).json({
        success: true,
        product,
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category, description, star, tag, sale, numOfReviews } = req.body;
    const photo = req.file;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Product Not Found", 404));
    if (photo) {
        rm(product.photo, () => {
            console.log("File Deleted");
        });
        product.photo = photo.path;
        return next(new ErrorHandler("Please add Photo", 400));
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    if (description)
        product.description = description;
    if (star)
        product.star = star;
    if (tag)
        product.tag = tag;
    await product.save();
    await invalidateCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });
    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product)
        return next(new ErrorHandler("Product Not Found", 404));
    rm(product.photo, () => {
        console.log("File Deleted");
    });
    await product.deleteOne();
    await invalidateCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
});
export const getAllProducts = TryCatch(async (req, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    // const key = `products-${search}-${sort}-${category}-${price}-${page}`;
    let products;
    let totalPage;
    // const cachedData = await redis.get(key);
    // if (cachedData) {
    //   const data = JSON.parse(cachedData);
    //   totalPage = data.totalPage;
    //   products = data.products;
    // } else {
    // 1,2,3,4,5,6,7,8
    // 9,10,11,12,13,14,15,16
    // 17,18,19,20,21,22,23,24
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i", //case sensitive
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price),
        };
    if (category)
        baseQuery.category = category;
    const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    const [productsFetched, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
    ]);
    products = productsFetched;
    totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    // }
    return res.status(200).json({
        success: true,
        products,
        totalPage,
    });
});
