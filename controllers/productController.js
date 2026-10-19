const Product = require("../models/product");
const Order = require("../models/order");
const Review = require("../models/review");

const seedProducts = [
  ["pixel-pro-9", "Pixel Pro 9", "Smartphones", 799], ["studio-one-headphones", "Studio One headphones", "Audio", 149], ["watch-ultra", "Watch Ultra", "Wearables", 329], ["airbook-14", "AirBook 14", "Computers", 999], ["protab-11", "ProTab 11", "Tablets", 429],
  ["craft-keyboard", "Craft mechanical keyboard", "Accessories", 89], ["quietbuds-pro", "QuietBuds Pro", "Audio", 119], ["luma-camera", "Luma mirrorless camera", "Cameras", 699], ["chargehub-7", "ChargeHub 7-in-1", "Accessories", 49], ["home-mini", "Home Mini speaker", "Smart home", 59],
  ["powercore-20k", "PowerCore 20K", "Accessories", 39], ["orbit-controller", "Orbit wireless controller", "Gaming", 69], ["pixel-a-series", "Pixel A-series", "Smartphones", 399], ["studio-mic", "Studio USB microphone", "Audio", 99], ["fit-band-3", "FitBand 3", "Wearables", 79],
  ["creator-laptop", "CreatorBook 16", "Computers", 1299], ["read-tab", "ReadTab E-ink", "Tablets", 189], ["travel-charger", "Travel charger 65W", "Accessories", 45], ["action-cam", "ActionCam 4K", "Cameras", 249], ["desk-light", "Halo smart desk light", "Smart home", 69],
].map(([slug, name, category, price]) => ({ slug, name, category, price, compareAt: Math.round(price * 1.15), image: "/heroimg.png", description: `A dependable ${category.toLowerCase()} essential for everyday use.`, features: ["Fast, reliable performance", "Two-year limited warranty", "Free dispatch on orders over $50"] }));

const listProducts = async (_req, res) => {
  try {
    let products = await Product.find().sort({ createdAt: -1 });
    if (!products.length) products = await Product.insertMany(seedProducts);
    res.json({ success: true, products });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const reviews = await Review.find({ productSlug: product.slug }).populate("userId", "firstName lastName").sort({ createdAt: -1 });
    res.json({ success: true, product, reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: "Cart is empty" });
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);
    const order = await Order.create({ userId: req.id, items, total, status: "completed" });
    res.status(201).json({ success: true, order });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productSlug = req.params.slug;
    const purchased = await Order.findOne({ userId: req.id, status: "completed", "items.productSlug": productSlug });
    if (!purchased) return res.status(403).json({ success: false, message: "Buy this product before reviewing it" });
    const review = await Review.create({ productSlug, userId: req.id, rating, comment });
    const stats = await Review.aggregate([{ $match: { productSlug } }, { $group: { _id: null, rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }]);
    await Product.updateOne({ slug: productSlug }, { rating: stats[0].rating, reviewCount: stats[0].reviewCount });
    res.status(201).json({ success: true, review });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 400;
    res.status(status).json({ success: false, message: error.code === 11000 ? "You already reviewed this product" : error.message });
  }
};

module.exports = { listProducts, getProduct, createOrder, createReview };
