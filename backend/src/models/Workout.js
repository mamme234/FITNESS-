import mongoose from 'mongoose';

const workoutExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    default: 3
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number,
    default: 0
  },
  restTime: {
    type: Number, // in seconds
    default: 60
  },
  tempo: String,
  order: Number,
  isCompleted: {
    type: Boolean,
    default: false
  },
  loggedSets: [{
    setNumber: Number,
    reps: Number,
    weight: Number,
    rpe: {
      type: Number,
      min: 1,
      max: 10
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    timestamp: Date
  }]
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['strength', 'hypertrophy', 'endurance', 'power', 'conditioning'],
    required: true
  },
  category: {
    type: String,
    enum: ['push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'hiit', 'stretching']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in minutes
    default: 45
  },
  daysPerWeek: {
    type: Number,
    min: 1,
    max: 7
  },
  exercises: [workoutExerciseSchema],
  isTemplate: {
    type: Boolean,
    default: false
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduledDays: [{
    type: Number, // 0=Sunday, 1=Monday, etc.
    min: 0,
    max: 6
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  totalVolume: {
    type: Number,
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total volume before saving
workoutSchema.pre('save', function(next) {
  if (this.exercises) {
    this.totalVolume = this.exercises.reduce((total, exercise) => {
      return total + (exercise.weight || 0) * (exercise.reps || 0) * (exercise.sets || 0);
    }, 0);
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Workout', workoutSchema);
