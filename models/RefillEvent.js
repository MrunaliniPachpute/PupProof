const mongoose = require("mongoose");

const RefillEventSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  machineId: {
    type: String,
    required: true
  },
  beforeImg: {
    type: String,
    required: true
  },
  afterImg: {
    type: String,
    required: true
  },
  pointsEarned: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
  type: String,
  enum: ['pending', 'completed', 'failed'],
  default: 'pending'
}

});

module.exports = mongoose.model("RefillEvent", RefillEventSchema);
