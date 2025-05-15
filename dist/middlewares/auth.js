import { User } from "../models/user.js";
// import admin from "../utils/firebase.js";
import ErrorHandler from "../utils/utility-class.js";
// Middleware to make sure only admin is allowed
export const adminOnly = async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("Saale Login Kr phle", 401));
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Saale Fake ID Deta Hai", 401));
    if (user.role !== "admin")
        return next(new ErrorHandler("Saale Aukat Nhi Hai Teri", 403));
    next();
};
// export const isAuthenticated = async (
//   req: Request & { user?: { _id: string } },
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.headers.authorization?.split("Bearer ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: Token missing" });
//   }
//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = { _id: decoded.uid };
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };
