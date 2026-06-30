import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'drink'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  carbs: {
    type: Number,
    default: 0,
    min: 0
  },
  fat: {
    type: Number,
    default: 0,
    min: 0
  },
  fiber: {
    type: Number,
    default: 0,
    min: 0
  },
  sugar: {
    type: Number,
    default: 0,
    min: 0
  },
  sodium: {
    type: Number,
    default: 0,
    min: 0
  },
  ingredients: [{
    name: String,
    amount: Number,
    unit: String
  }],
  preparation: String,
  imageUrl: String,
  isHealthy: {
    type: Boolean,
    default: false
  },
  tags: [String],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  meals: [mealSchema],
  water: {
    type: Number,
    default: 0,
    min: 0
  },
  calories: {
    type: Number,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  fiber: {
    type: Number,
    default: 0
  },
  sugar: {
    type: Number,
    default: 0
  },
  sodium: {
    type: Number,
    default: 0
  },
  goals: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 150 },
    carbs: { type: Number, default: 250 },
    fat: { type: Number, default: 70 },
    water: { type: Number, default: 3000 }
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

// Calculate totals before saving
nutritionSchema.pre('save', function(next) {
  if (this.meals && this.meals.length > 0) {
    this.calories = this.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    this.protein = this.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    this.carbs = this.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    this.fat = this.meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
    this.fiber = this.meals.reduce((sum, meal) => sum + (meal.fiber || 0), 0);
    this.sugar = this.meals.reduce((sum, meal) => sum + (meal.sugar || 0), 0);
    this.sodium = this.meals.reduce((sum, meal) => sum + (meal.sodium || 0), 0);
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Nutrition', nutritionSchema);
