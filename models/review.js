const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  productSlug: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
}, { timestamps: true });

reviewSchema.index({ productSlug: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model("review", reviewSchema);
