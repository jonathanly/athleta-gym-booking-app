const mongoose = require('mongoose');
const db = require('./init');
const Schema = mongoose.Schema;

const trainingSessionSchema = new Schema({
  title: { type: String, required: true },
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  time: String,
  duration: { type: Number, min: 0 },
  capacity: { type: Number, min: 0 },
  dateAdded: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

const TrainingSession = mongoose.model('TrainingSession', trainingSessionSchema);

module.exports = TrainingSession
