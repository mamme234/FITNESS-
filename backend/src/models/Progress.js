import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  },
  weight: {
    type: Number,
    required: true
  },
  reps: {
    type: Number,
    required: true
  },
  sets: {
    type: Number,
    required: true
  },
  volume: {
    type: Number, // weight * reps * sets
    required: true
  },
  e1rm: {
    type: Number, // Estimated 1 Rep Max
    default: 0
  },
  rpe: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: String,
  date: {
    type: Date,
    default: Date.now
  }
});

// Calculate volume and E1RM before saving
progressSchema.pre('save', function(next) {
  this.volume = this.weight * this.reps * this.sets;
  // Epley formula for E1RM
  this.e1rm = this.weight * (1 + this.reps / 30);
  next();
});

// Index for fast queries
progressSchema.index({ userId: 1, exerciseId: 1, date: -1 });

export default mongoose.model('Progress', progressSchema);
