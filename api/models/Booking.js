const mongoose = require('mongoose');
const db = require('./init');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  date: String,
  _trainingSession: { type: Schema.Types.ObjectId, ref: 'TrainingSession' },
  _attendees: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

// allows searching of date & _groupClass fields
bookingSchema.index({ date: 1, _TrainingSession: 1, _User: 1 });

const Booking = mongoose.model('booking', bookingSchema);

module.exports = Booking
