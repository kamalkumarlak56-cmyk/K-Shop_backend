const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { listProducts, getProduct, createOrder, createReview } = require("../controllers/productController");

const router = express.Router();
router.get("/", listProducts);
router.get("/:slug", getProduct);
router.post("/orders", isAuthenticated, createOrder);
router.post("/:slug/reviews", isAuthenticated, createReview);

module.exports = router;
