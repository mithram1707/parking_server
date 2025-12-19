const mongoose = require('mongoose');

const parkingHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slotNumber: {
    type: String,
    required: true
  },
  parkedAt: {
    type: Date,
    default: Date.now
  },
  releasedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ParkingHistory', parkingHistorySchema);