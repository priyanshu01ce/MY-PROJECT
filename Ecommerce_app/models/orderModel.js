import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
      },
    ],
    buyer: {
      type: mongoose.ObjectId,
      ref: "EcomUsers",
      required: true,
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "delivered", "cancelled"], // Fixed typo in "delivered"
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
