import { User } from "../models/user.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
export const newUser = TryCatch(async (req, res, next) => {
    const { name, email, photo, gender, _id, dob } = req.body;
    let user = await User.findById(_id);
    if (user)
        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`,
        });
    if (!_id || !name || !email || !photo || !gender || !dob)
        return next(new ErrorHandler("Please add all fields", 400));
    user = await User.create({
        name,
        email,
        photo,
        gender,
        _id,
        dob: new Date(dob),
    });
    return res.status(201).json({
        success: true,
        message: `Welcome, ${user.name}`,
    });
});
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users,
    });
});
export const getUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    return res.status(200).json({
        success: true,
        user,
    });
});
export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    await user.deleteOne();
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});
export const setCartItems = async (req, res, next) => {
    const { cartItems } = req.body;
    if (!Array.isArray(cartItems)) {
        return res.status(400).json({ message: "Invalid cartItems format" });
    }
    const user = await User.findById(req.user?._id);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    user.cartItems = cartItems;
    await user.save();
    return res.status(200).json({ message: "Cart saved successfully" });
};
export const getCartItems = async (req, res, next) => {
    // const id = req.user._id;
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.user._id).populate("cartItems.product");
    if (!user)
        return res.status(404).json({ message: "User not found" });
    res.status(200).json({ cartItems: user.cartItems });
};
