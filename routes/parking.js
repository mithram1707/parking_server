const express = require('express');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingHistory = require('../models/ParkingHistory');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get all parking slots
router.get('/slots', auth, async (req, res) => {
  try {
    const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's current parked slot
router.get('/user-slot', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ slotNumber: user.currentParkingSlot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book a parking slot
router.post('/book', auth, async (req, res) => {
  try {
    const { slotId } = req.body;
    const userId = req.user._id;

    // Check if user already has a parking slot
    const user = await User.findById(userId);
    if (user.currentParkingSlot) {
      return res.status(400).json({ message: 'You already have a parking slot' });
    }

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (slot.status === 'occupied') {
      return res.status(400).json({ message: 'Parking slot is already occupied' });
    }

    // Update slot
    slot.status = 'occupied';
    slot.occupiedBy = userId;
    slot.occupiedAt = new Date();
    await slot.save();

    // Update user
    user.currentParkingSlot = slot.slotNumber;
    await user.save();

    // Create parking history record
    const history = new ParkingHistory({
      user: userId,
      slotNumber: slot.slotNumber
    });
    await history.save();

    res.json({ message: 'Parking slot booked successfully', slotNumber: slot.slotNumber });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Release parking slot
router.post('/release', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.currentParkingSlot) {
      return res.status(400).json({ message: 'You do not have a parking slot to release' });
    }

    // Find and update slot
    const slot = await ParkingSlot.findOne({ slotNumber: user.currentParkingSlot });
    if (slot) {
      slot.status = 'available';
      slot.occupiedBy = null;
      slot.occupiedAt = null;
      await slot.save();
    }

    // Update user
    user.currentParkingSlot = null;
    await user.save();

    // Update parking history
    await ParkingHistory.findOneAndUpdate(
      { user: userId, slotNumber: slot.slotNumber, releasedAt: null },
      { releasedAt: new Date() }
    );

    res.json({ message: 'Parking slot released successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update slot status (admin only)
router.put('/slots/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    slot.status = status;
    if (status === 'available') {
      slot.occupiedBy = null;
      slot.occupiedAt = null;
    }
    await slot.save();

    res.json({ message: 'Slot updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;