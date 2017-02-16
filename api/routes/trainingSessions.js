const express = require('express');
const TrainingSession = require('../models/TrainingSession');

const router = express.Router();

// Get index of all training sessions
router.get('/', function(req, res, next) {
  const { title, day, time } = req.query
  let conditions = {}

  if (title) { conditions.title = title }
  if (day) { conditions.day = day }
  if (time) { conditions.time = time }

  TrainingSession.find(conditions)
    .then(trainingSessions => {
      console.log("Initiating data..")
      res.json(trainingSessions);
    })
    .catch(err => {
      res.json(err)
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
  const { title, day, time, duration, capacity } = req.body;

  TrainingSession.create({
    title: title,
    day: day,
    time: time,
    duration: duration,
    capacity: capacity
    })
    .then(trainingSession => {
      res.json(trainingSession);
    })
    .catch(err => {
      res.status(400).json(err)
  });
});

// Update single training session from database
router.patch('/:id', function(req, res, next) {
  const id = req.params.id;
  console.log("req.params --", req.params)
  console.log("req.body --", req.body)
  const { title, day, time, duration, capacity } = req.body;

  TrainingSession.findByIdAndUpdate(id)
    .then(trainingSession => {
      console.log("before: ", trainingSession)
      // update params that are only present
      if (title) trainingSession.title = title;
      if (day) trainingSession.day = day;
      if (time) trainingSession.time = time;
      if (duration) trainingSession.duration = duration;
      if (capacity) trainingSession.capacity = capacity;
      trainingSession.lastUpdated = Date.now();
      trainingSession.save()
      .then(savedTrainingSession => {
        res.json(savedTrainingSession)
        console.log("after: " + savedTrainingSession)
      })
      .catch(error => {
        res.json(error)
      })
    })
    .catch(error => {
      res.json(error)
    });
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
