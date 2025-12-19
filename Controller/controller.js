const { ParkingSlot, User } = require('../Model/model');

const createSlot = async (req, res) => {
  try {
    const { slotNumber, floor, zone } = req.body;
    const slot = new ParkingSlot({ slotNumber, floor, zone });
    await slot.save();
    res.status(201).json({ message: 'Slot created', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find().populate('userId', 'name vehicleNumber');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSlotById = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    const { slotNumber, floor, zone, status } = req.body;
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      { slotNumber, floor, zone, status },
      { new: true }
    );
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot updated', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const parkVehicle = async (req, res) => {
  try {
    const { slotId, vehicleNumber } = req.body;
    const slot = await ParkingSlot.findById(slotId);
    
    if (!slot || slot.status === 'occupied') {
      return res.status(400).json({ message: 'Slot not available' });
    }
    
    slot.status = 'occupied';
    slot.vehicleNumber = vehicleNumber;
    slot.userId = req.user._id;
    slot.parkedAt = new Date();
    await slot.save();
    
    res.json({ message: 'Vehicle parked successfully', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unparkVehicle = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.slotId);
    
    if (!slot || slot.status === 'available') {
      return res.status(400).json({ message: 'Slot is already empty' });
    }
    
    slot.status = 'available';
    slot.vehicleNumber = null;
    slot.userId = null;
    slot.parkedAt = null;
    await slot.save();
    
    res.json({ message: 'Vehicle unparked successfully', slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyParking = async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({ userId: req.user._id, status: 'occupied' });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const initializeSlots = async (req, res) => {
  try {
    const count = await ParkingSlot.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Slots already initialized' });
    }
    
    const slots = [];
    const zones = ['A', 'B', 'C'];
    const floors = ['Ground', 'First', 'Second'];
    
    for (let floor of floors) {
      for (let zone of zones) {
        for (let i = 1; i <= 10; i++) {
          slots.push({
            slotNumber: `${zone}${i}`,
            floor,
            zone,
            status: 'available'
          });
        }
      }
    }
    
    await ParkingSlot.insertMany(slots);
    res.json({ message: 'Parking slots initialized successfully', count: slots.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
  parkVehicle,
  unparkVehicle,
  getMyParking,
  initializeSlots
};