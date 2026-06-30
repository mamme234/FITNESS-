import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  telegramId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  age: {
    type: Number,
    min: 13,
    max: 100
  },
  height: {
    type: Number, // in cm
    min: 100,
    max: 300
  },
  weight: {
    type: Number, // in kg
    min: 20,
    max: 300
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: String,
    enum: ['lose_weight', 'build_muscle', 'increase_strength', 'improve_endurance', 'general_fitness']
  }],
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate'
  },
  experience: {
    type: String,
    enum: ['less_than_1_year', '1_3_years', '3_5_years', 'more_than_5_years'],
    default: 'less_than_1_year'
  },
  streak: {
    type: Number,
    default: 0
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'coach', 'admin'],
    default: 'user'
  },
  preferences: {
    workoutTime: String,
    restDays: [Number],
    notifications: {
      workout: { type: Boolean, default: true },
      nutrition: { type: Boolean, default: true },
      challenges: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    },
    units: {
      weight: { type: String, enum: ['kg', 'lb'], default: 'kg' },
      height: { type: String, enum: ['cm', 'ft'], default: 'cm' }
    }
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.model('User', userSchema);
