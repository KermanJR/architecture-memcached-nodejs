const express = require("express");
const ProductController = require("../controllers/productController");
const isAuthenticated = require("../utils/isAuthenticated");

const router = express.Router();
const productController = new ProductController();

router.post("/", productController.createProduct);
router.post("/buy", productController.createOrder);
router.get("/", productController.getProducts);


module.exports = router;
