const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

// Index: read all
router.get('/', function(req, res, next) {
  const { date, trainingSession, user } = req.query
  let conditions = {}
  // if date query exists, set conditions.date equal to date query
  if (date) {
    conditions.date = date
  }
  if (trainingSession) {
    conditions._trainingSession = trainingSession
  }
  if (user) {
    conditions._users = user
  }

  Booking.find(conditions)
    .populate('_trainingSession _users')
    .then(bookings => {
      res.json(bookings);
    })
    .catch(err => {
      res.json({ message: err.message })
    });
});

// Show: read specific
router.get('/:id', function(req, res, next) {
    const { id } = req.params;
    Booking.findById(id)
        .then(booking => {
            res.json(booking);
        })
        .catch(err => {
          res.json({ message: err.message })
        });
});

// Create: create single
router.post('/', function(req, res, next) {
  const { date, _trainingSession, _users } = req.body
  Booking.findOneAndUpdate({
    date: date,
    _trainingSession: _trainingSession
    },
    { $push: { _users: _users }},
    { upsert: true, new: true })
    .then(booking => {
      res.json(booking);
    })
    .catch(err => {
      res.json({ message: err.message })
    });
});

// Delete: delete single
router.delete('/:id', function(req, res, next) {
  const { id } = req.params;
  Booking.findByIdAndRemove(id)
    .then(booking => {
        res.json(booking);
    })
    .catch(err => {
      res.json({ message: err.message })
  });
});

module.exports = router;
