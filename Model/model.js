const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  vehicleNumber: { type: String },
  preferredSlots: [{ type: String }],
  notifications: [{ 
    message: String, 
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  floor: { type: String, required: true },
  zone: { type: String, required: true },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  vehicleNumber: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parkedAt: { type: Date },
  position: { x: Number, y: Number }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

module.exports = { User, ParkingSlot };