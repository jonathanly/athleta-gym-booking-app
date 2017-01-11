const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

// Index: read all
// /
// /?date=2017-01-09&groupClass=X
router.get('/', function(req, res, next) {
  const { date, user, trainingSession } = req.query
  let conditions = {}

  if (date) {
    conditions.date = date
  }
  if (trainingSession) {
    conditions._trainingSession = trainingSession
  }
  if (user) {
    conditions.user = user
  }

  Booking.find(conditions)
      .then(bookings => {
          res.json(bookings);
      })
      .catch(err => {
        res.json(err)
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
          res.json(err)
        });
});

// Create: create single
router.post('/', function(req, res, next) {
  Booking.create(req.body)
      .then(booking => {
          res.json(booking);
      })
      .catch(err => {
        res.json(err)
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
      res.json(err)
  });
});

module.exports = router;
