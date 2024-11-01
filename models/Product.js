const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to Category model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  cost: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("products", ProductSchema);
module.exports = Product;
