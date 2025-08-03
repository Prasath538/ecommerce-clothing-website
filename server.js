///server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
let db;

async function connect() {
  try {
    await client.connect();
    db = client.db('ecommerceapp');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
connect();

// REGISTER API
app.post('/api/register', async (req, res) => {
  const { username, email, phone, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.collection('users').findOne({ username });
  if (existingUser) {
    return res.json({ success: false, message: 'User already exists' });
  }

  await db.collection('users').insertOne({
    username,
    email,
    phone,
    password: hashedPassword,
    role,
  });
  res.json({ success: true, message: 'User registered successfully' });
});

// LOGIN API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.collection('users').findOne({ username });

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }

  res.json({ success: true, message: 'Login successful', role: user.role });
});

// Checkout API
app.post('/api/checkout', async (req, res) => {
  const { username, products, shipping, total } = req.body;

  if (!username || !products || !Array.isArray(products) || products.length === 0) {
    return res.json({ success: false, message: 'Invalid checkout data' });
  }

  try {
    // Ensure prices are stored as numbers
    const formattedProducts = products.map(product => ({
      ...product,
      price: Number(product.price),
    }));

    // Check and decrement stock
    for (const product of formattedProducts) {
      const productInDb = await db.collection('products').findOne({ title: product.product }); // Assuming 'product' in the order object is the product title
      if (!productInDb || productInDb.stock < product.quantity) {
        // If product not found or insufficient stock, rollback and inform the user
        return res.json({ success: false, message: `Insufficient stock for ${product.product}` });
      }
      // Decrement stock
      await db.collection('products').updateOne(
        { title: product.product },
        { $inc: { stock: -product.quantity } }
      );
    }

    // Insert the order
    await db.collection('orders').insertOne({
      username,
      products: formattedProducts,
      shipping,
      total,
      date: new Date(),
    });

    res.json({ success: true, message: 'Checkout data stored and stock updated successfully' });
  } catch (err) {
    console.error('Checkout error:', err);
    res.json({ success: false, message: 'Error storing checkout data' });
  }
});

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find().toArray();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.json({ success: false, message: 'Error fetching orders' });
  }
});

// GET orders by username
app.get('/api/orders/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const orders = await db.collection('orders').find({ username }).toArray();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders by username:', error);
    res.json({ success: false, message: 'Error fetching orders by username' });
  }
});

// UPDATE order by _id
app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedData = req.body;

    // Ensure prices are numbers
    const formattedData = {
      ...updatedData,
      products: updatedData.products.map(product => ({
        ...product,
        price: Number(product.price),
      })),
    };

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: formattedData }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true, message: 'Order updated successfully' });
    } else {
      res.json({ success: false, message: 'Order not found or not updated' });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.json({ success: false, message: 'Error updating order' });
  }
});

// DELETE order by _id
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    const result = await db.collection('orders').deleteOne({
      _id: new ObjectId(orderId),
    });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Order deleted successfully' });
    } else {
      res.json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.json({ success: false, message: 'Error deleting order' });
  }
});

// *** Product Management Endpoints ***

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.json({ success: false, message: 'Error fetching products' });
  }
});

// ADD a new product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body;
    // Basic validation
    if (!newProduct.title || !newProduct.price || newProduct.stock === undefined) {
      return res.json({ success: false, message: 'Missing required product fields' });
    }
    // Ensure price and stock are numbers
    newProduct.price = Number(newProduct.price);
    newProduct.stock = Number(newProduct.stock);

    const result = await db.collection('products').insertOne(newProduct);
    res.json({ success: true, message: 'Product added successfully', data: result.insertedId });
  } catch (error) {
    console.error('Error adding product:', error);
    res.json({ success: false, message: 'Error adding product' });
  }
});

// UPDATE product by _id
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    // Ensure price and stock are numbers
    if (updatedData.price !== undefined) updatedData.price = Number(updatedData.price);
    if (updatedData.stock !== undefined) updatedData.stock = Number(updatedData.stock);

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: updatedData }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true, message: 'Product updated successfully' });
    } else {
      res.json({ success: false, message: 'Product not found or not updated' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.json({ success: false, message: 'Error updating product' });
  }
});

// DELETE product by _id
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(productId),
    });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      res.json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.json({ success: false, message: 'Error deleting product' });
  }
});


// Start Server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});