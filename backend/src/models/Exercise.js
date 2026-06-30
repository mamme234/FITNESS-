import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  aliases: [String],
  description: {
    type: String,
    required: true
  },
  instructions: [String],
  muscleGroup: {
    type: String,
    required: true,
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'quadriceps', 'hamstrings', 'glutes', 'calves',
      'abdominals', 'obliques', 'lower_back',
      'full_body', 'cardio'
    ]
  },
  secondaryMuscles: [String],
  equipment: {
    type: String,
    enum: [
      'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine',
      'bodyweight', 'bands', 'medicine_ball', 'other'
    ],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  type: {
    type: String,
    enum: ['compound', 'isolation', 'functional', 'cardio', 'stretching'],
    default: 'compound'
  },
  force: {
    type: String,
    enum: ['push', 'pull', 'hold', 'isometric']
  },
  mechanic: {
    type: String,
    enum: ['compound', 'isolation']
  },
  imageUrl: String,
  videoUrl: String,
  thumbnailUrl: String,
  gifUrl: String,
  benefits: [String],
  commonMistakes: [String],
  tips: [String],
  safetyWarnings: [String],
  alternatives: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Text index for search
exerciseSchema.index({ name: 'text', description: 'text', aliases: 'text' });

export default mongoose.model('Exercise', exerciseSchema);
