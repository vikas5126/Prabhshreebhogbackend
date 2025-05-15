import mongoose from "mongoose";
import validator from "validator";

interface IUser  extends Document {
    _id: string;
    photo: string;
    name: string;
    email: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    age: number;
    cartItems: Array<{
        product: mongoose.Schema.Types.ObjectId;
        quantity: number;
        addedAt: Date;
    }>;
}

const  schema = new mongoose.Schema({
    _id:{
        type: String,
        required: [true, "Please provide a user ID"],
        unique: true,
    },
    photo:{
        type: String,
        required:[true, "Please provide a photo"],
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email already exists"],
        validate: validator.default.isEmail,
    },

    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "please enter gender"]
    },
    dob: {
        type: Date,
        required: [true, "please enter date of birth"],
    },
    cartItems: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }
],
}, { timestamps: true });


schema.virtual("age").get(function () {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
);

export const User = mongoose.model<IUser>("User", schema);