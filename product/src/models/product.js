const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  productId: { type: String, required: true, unique: true },
  category: { type: String }, 
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }, 
  ratings: { type: Number, default: 0 }, 
  comments: [{ type: String }] 
}, { collection: 'products' });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
