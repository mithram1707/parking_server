const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./Db/db');

const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/user', userRoutes);

// PORT (Render compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
