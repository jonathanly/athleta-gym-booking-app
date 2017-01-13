const express = require('express');
const TrainingSession = require('../models/TrainingSession');

const router = express.Router();

// Get index of all training sessions
router.get('/', function(req, res, next) {
    TrainingSession.find()
        .then(trainingSessions => {
            res.json(trainingSessions);
        });
});

// Get single training session
router.get('/:id', function(req, res, next) {
    const { id } = req.params;
    TrainingSession.findById(id)
        .then(trainingSession => {
            res.json(trainingSession);
        });
});

// Create new instance of TrainingSession
router.post('/', function(req, res, next) {
  TrainingSession.create(req.body)
      .then(trainingSession => {
          res.json(trainingSession);
      })
      .catch(err => {
        res.json(err)
    });
});

// Update single training session from database
router.put('/:id', function(req, res, next) {
  const id = req.params.id;
  let { title, day, time, duration, capacity } = req.body;

  TrainingSession.findByIdAndUpdate(id)
    .then(trainingSession => {
      // update params that are only present
      if (title) trainingSession.title = title;
      if (day) trainingSession.day = day;
      if (time) trainingSession.time = time;
      if (duration) trainingSession.duration = duration;
      if (capacity) trainingSession.capacity = title;
      trainingSession.lastUpdated = Date.now();
      trainingSession.save()
      .then(savedTrainingSession => {
        res.json(savedTrainingSession)
      })
      .catch(err => {
        res.json({"error": "Training session could not be updated", err})
      })
    })
    .catch(err => {res.json(err)});
});

// Delete a single training session
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
