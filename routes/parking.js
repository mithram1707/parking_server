const express = require('express');
const { ParkingSlot, User } = require('../Model/model');
const { auth } = require('../Authorization/auth');

const router = express.Router();

// GET ALL SLOTS
router.get('/slots', auth, async (req, res) => {
  try {
    const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// BOOK SLOT
router.post('/book', auth, async (req, res) => {
  try {
    const { slotId } = req.body;
    const user = await User.findById(req.user._id);

    if (user.currentParkingSlot) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const slot = await ParkingSlot.findById(slotId);
    if (!slot || slot.status === 'occupied') {
      return res.status(400).json({ message: 'Slot unavailable' });
    }

    slot.status = 'occupied';
    slot.occupiedBy = user._id;
    await slot.save();

    user.currentParkingSlot = slot.slotNumber;
    await user.save();

    res.json({ message: 'Slot booked', slotNumber: slot.slotNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RELEASE SLOT
router.post('/release', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const slot = await ParkingSlot.findOne({
      slotNumber: user.currentParkingSlot
    });

    if (slot) {
      slot.status = 'available';
      slot.occupiedBy = null;
      await slot.save();
    }

    user.currentParkingSlot = null;
    await user.save();

    res.json({ message: 'Slot released' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
