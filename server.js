/**
 * MP NAFAKA - Node.js Express & MongoDB API Server
 * 
 * INSTRUCTIONS:
 * 1. Install dependencies: npm install express mongoose cors dotenv
 * 2. Create a .env file and paste your MongoDB URI:
 *    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mp_nafaka?retryWrites=true&w=none
 * 3. Run server: node server.js
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' })); // Allows Base64 image uploads
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mp_nafaka';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Product Schema Definition
const productSchema = new mongoose.Schema({
  nameSw: { type: String, required: true },
  nameEn: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true, default: 'KG' },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  descSw: { type: String, default: '' },
  descEn: { type: String, default: '' }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// REST API ROUTES

// 1. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// 2. CREATE NEW PRODUCT (ADMIN)
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
});

// 3. UPDATE PRODUCT (ADMIN)
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Failed to update product", error: error.message });
  }
});

// 4. DELETE PRODUCT (ADMIN)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: "OK", database: "MongoDB" }));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 MP NAFAKA Server running on http://localhost:${PORT}`);
});