const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorMiddleware');

const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

// Student routes
app.use('/api/students', studentRoutes);
// Admin routes
app.use('/api/admin', adminRoutes);
// Auth routes (forgot/reset password)
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

const path = require('path');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully 🍃'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../josproject')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Export for Vercel serverless deployment
module.exports = app;
