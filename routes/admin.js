const { adminAuth } = require('./auth');

const express = require('express');

const { User, ParkingSlot } = require('../Model/model');
const { adminAuth } = require('../Authorization/auth');

const router = express.Router();

/* =====================
   GET ALL USERS
===================== */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* =====================
   DELETE USER
===================== */
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

/* =====================
   PARKING STATS
===================== */
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
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
