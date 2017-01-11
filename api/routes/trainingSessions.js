const express = require('express');
const TrainingSession = require('../models/TrainingSession');

const router = express.Router();

// Index: read all
router.get('/', function(req, res, next) {
    TrainingSession.find()
        .then(trainingSessions => {
            res.json(trainingSessions);
        });
});

// Show: read specific
router.get('/:id', function(req, res, next) {
    const { id } = req.params;
    TrainingSession.findById(id)
        .then(trainingSession => {
            res.json(trainingSession);
        });
});

// Create: create single
router.post('/', function(req, res, next) {
  TrainingSession.create(req.body)
      .then(trainingSession => {
          res.json(trainingSession);
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
  TrainingSession.findByIdAndRemove(id)
    .then(trainingSession => {
        res.json(trainingSession);
    })
    .catch(err => {
      res.json(err)
  });
});

module.exports = router;
