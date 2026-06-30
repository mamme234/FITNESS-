import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special'],
    required: true
  },
  category: {
    type: String,
    enum: ['workout', 'nutrition', 'weight_loss', 'strength', 'endurance', 'flexibility'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  goal: {
    type: String,
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'reps'
  },
  reward: {
    type: String,
    required: true
  },
  rewardXp: {
    type: Number,
    default: 100
  },
  badge: {
    name: String,
    icon: String,
    color: String
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// REMOVED: The method was conflicting with the property
// The method is now a virtual or static method instead

// Use a virtual property instead of a method
challengeSchema.virtual('isChallengeActive').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && this.isActive;
});

// Or use a static method
challengeSchema.statics.isChallengeActive = function(challenge) {
  const now = new Date();
  return now >= challenge.startDate && now <= challenge.endDate && challenge.isActive;
};

// Update timestamp
challengeSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.model('Challenge', challengeSchema);
