require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productionRoutes = require('./routes/productionRoutes');
const userRoutes = require('./routes/userRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/raw-materials', materialRoutes);
app.use('/api/purchase-orders', orderRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TexFlow Textile Production API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TexFlow Server running on port ${PORT}`);
});
