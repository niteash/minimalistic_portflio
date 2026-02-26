const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema({
  studentId: String,
  latitude: Number,
  longitude: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SOSAlert", sosSchema);
