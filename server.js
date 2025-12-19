const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');
const todoRoutes = require('./routes/todos');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = require('./Db/db');
connectDB();

// Initialize parking slots
const initializeParkingSlots = async () => {
  const { ParkingSlot } = require('./Model/model');
  const count = await ParkingSlot.countDocuments();
  if (count === 0) {
    const slots = [];
    for (let i = 1; i <= 20; i++) {
      slots.push({
        slotNumber: `A${i}`,
        status: 'available'
      });
    }
    await ParkingSlot.insertMany(slots);
    console.log('Parking slots initialized');
  }
};

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  initializeParkingSlots();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});