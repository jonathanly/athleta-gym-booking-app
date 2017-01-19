const mongoose = require('mongoose');
const db = require('./init');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  date: { type: String, required: true },
  _trainingSession: { type: Schema.Types.ObjectId, ref: 'TrainingSession', required: true },
  _users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }]
});

// indexing fields to allow searching of date, _trainingSession & _attendees fields
bookingSchema.index({ date: 1, _trainingSession: 1, _users: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking
