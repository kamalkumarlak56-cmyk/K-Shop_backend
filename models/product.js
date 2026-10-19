const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  compareAt: Number,
  image: String,
  description: String,
  features: [String],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("product", productSchema);
