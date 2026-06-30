import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['strength', 'endurance', 'consistency', 'nutrition', 'challenge', 'milestone'],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: String,
  xpReward: {
    type: Number,
    default: 50
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: Date,
  progress: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Achievement', achievementSchema);
