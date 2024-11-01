const path = require("path");
const { fileURLToPath } = require("url");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/Auth");

const Category = require("./models/Category");
const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();
const cors = require("cors");

mongoose
  .connect(
    "mongodb+srv://kartikjain095:kar24mongo@cluster0.bao00.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("Failed to connect");
  });

// const path = require("path");

app.use(express.json());
app.use(cors());
// app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use("/api/Auth", authRoutes);

app.use(express.static(path.join(__dirname, "build")));

// Endpoint to create a new product
app.post("/api/products", async (req, res) => {
  const { categoryId, name, description, cost } = req.body;
  try {
    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });

    // Create the product
    const product = await Product.create({
      categoryId,
      name,
      description,
      cost,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Error creating product" });
  }
});

// Endpoint to get all products with category details
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find(); // Retrieve all categories
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Error fetching categories" });
  }
});

app.get("/api/products/category/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    // Find products by categoryId
    const products = await Product.find({ categoryId });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Error fetching products by category" });
  }
});

app.get("/api/products/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: "Error fetching product" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { userId, products } = req.body;

  try {
    // Fetch product details from the database
    const productDetails = await Promise.all(
      products.map(async (product) => {
        const productData = await Product.findById(product.productId);
        return {
          productId: product.productId,
          quantity: product.quantity,
          cost: productData.cost, // Assuming cost is a field in the Product model
        };
      })
    );

    // Calculate total cost
    const totalCost = productDetails.reduce(
      (sum, product) => sum + product.cost * product.quantity,
      0
    );

    // Create a new order
    const newOrder = new Order({
      userId,
      products: productDetails,
      totalCost,
    });

    await newOrder.save(); // Save the order to the database

    res.status(201).json(newOrder); // Respond with the created order
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({ error: "Error processing order" });
  }
});

app.listen(3001, () => {
  console.log("port connected");
});
