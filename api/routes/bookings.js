const express = require('express');
const Booking = require('../models/Booking');
// const TrainingSession = require('../models/TrainingSession');

const router = express.Router();

// Index: read all
// /
// /?date=2017-01-09&groupClass=X
router.get('/', function(req, res, next) {
  const { date, trainingSession } = req.query
  let conditions = {}

  // if date query exists, set conditions.date equal to date query
  if (date) {
    conditions.date = date
  }
  if (trainingSession) {
    conditions._trainingSession = trainingSession
  }

  // Booking.count()
  //   .then(count => { console.log('bookings', count) })

  Booking.find(conditions)
    .populate('_trainingSession')
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
  Booking.create(req.body)
      .then(booking => {
          res.json(booking);
      })
      .catch(err => {
        res.json({ message: err.message })
      });
});
//
// // Update: update single
// router.patch('/:id', function(req, res, next) {
//     const { id } = req.params;
//     let { change } = req.body;
//     change = parseInt(change, 10)
//     // Change is 1 or -1
//     Class.findByIdAndUpdate(id, {
//         $inc: { count: change }
//     }, { new: true })
//         .then(counter => {
//             res.json(counter);
//         });
// });
//
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
