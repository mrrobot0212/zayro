const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// মঙ্গোডিবি লোকাল ডাটাবেজ কানেকশন
mongoose.connect('mongodb://127.0.0.1:27017/flex_shop')
.then(() => console.log('🎉 MongoDB Connected Successfully!'))
.catch(err => console.error('❌ Database connection error:', err));

// প্রোডাক্ট মডেল (স্টক ফিল্ড সহ)
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    price: Number,
    img: String,
    stock: { type: Number, default: 0 }
}));

// অর্ডার মডেল (কাস্টমার ইনফো সহ)
const Order = mongoose.model('Order', new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    customerAddress: String,
    items: Array,
    totalAmount: Number,
    orderDate: { type: Date, default: Date.now }
}));

// API: সব প্রোডাক্ট নিয়ে আসা
app.get('/api/products', async (req, res) => {
    try { 
        res.json(await Product.find()); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// API: নতুন প্রোডাক্ট ও স্টক অ্যাড করা
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        res.status(201).json(await newProduct.save());
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// API: অ্যাডমিন প্যানেল থেকে স্টক লেভেল আপডেট করা
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true });
        res.json(updated);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// API: কাস্টমার অর্ডার প্লেস করা এবং স্টক মাইনাস করা
app.post('/api/orders', async (req, res) => {
    try {
        const { items } = req.body;
        for (let item of items) {
            const prod = await Product.findById(item._id);
            if (!prod || prod.stock < item.quantity) {
                return res.status(400).json({ success: false, error: `${item.name} পর্যাপ্ত স্টকে নেই!` });
            }
        }
        for (let item of items) {
            await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
        }
        const savedOrder = await new Order(req.body).save();
        res.status(201).json({ success: true, order: savedOrder });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
    }
});

// API: সব অর্ডারের লিস্ট দেখা
app.get('/api/orders', async (req, res) => {
    try { 
        res.json(await Order.find().sort({ orderDate: -1 })); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Full-Stack Server running on http://localhost:${PORT}`));