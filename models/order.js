const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  items: [{ productSlug: String, name: String, quantity: Number, price: Number }],
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("order", orderSchema);
