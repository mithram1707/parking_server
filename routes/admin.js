const express = require('express');
const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Release parking slot if user has one
    if (user.currentParkingSlot) {
      await ParkingSlot.findOneAndUpdate(
        { slotNumber: user.currentParkingSlot },
        { status: 'available', occupiedBy: null, occupiedAt: null }
      );
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get parking statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
    const availableSlots = totalSlots - occupiedSlots;
    const totalUsers = await User.countDocuments();

    res.json({
      totalSlots,
      occupiedSlots,
      availableSlots,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new parking slot
router.post('/slots', adminAuth, async (req, res) => {
  try {
    const { slotNumber } = req.body;
    
    const existingSlot = await ParkingSlot.findOne({ slotNumber });
    if (existingSlot) {
      return res.status(400).json({ message: 'Slot number already exists' });
    }

    const slot = new ParkingSlot({ slotNumber });
    await slot.save();
    
    res.status(201).json({ message: 'Parking slot added successfully', slot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete parking slot
router.delete('/slots/:id', adminAuth, async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (slot.status === 'occupied') {
      return res.status(400).json({ message: 'Cannot delete occupied parking slot' });
    }

    await ParkingSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Parking slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;