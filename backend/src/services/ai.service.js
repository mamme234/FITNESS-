import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';

// Generate personalized workout
export const generateWorkout = async (userId, params) => {
  try {
    const { goal, experience, daysPerWeek, equipment, availableTime } = params;

    // Fetch exercises based on parameters
    const exercises = await Exercise.find({
      difficulty: experience,
      equipment: { $in: equipment || ['bodyweight', 'dumbbell'] },
      isActive: true
    }).limit(10);

    if (exercises.length === 0) {
      throw new Error('No exercises found matching criteria');
    }

    // Create workout structure
    const workout = {
      name: `${goal.charAt(0).toUpperCase() + goal.slice(1)} Workout`,
      description: `Personalized ${goal} workout for ${experience} level`,
      type: goal === 'strength' ? 'strength' : 'hypertrophy',
      difficulty: experience,
      duration: availableTime || 45,
      daysPerWeek: daysPerWeek || 3,
      exercises: exercises.map((ex, index) => ({
        exerciseId: ex._id,
        sets: experience === 'beginner' ? 3 : 4,
        reps: goal === 'strength' ? 8 : 12,
        weight: 0,
        restTime: 60,
        order: index + 1
      }))
    };

    return workout;
  } catch (error) {
    console.error('❌ AI workout generation error:', error);
    throw error;
  }
};

// Get exercise recommendations
export const getExerciseRecommendations = async (userId, muscleGroup) => {
  try {
    const exercises = await Exercise.find({
      muscleGroup: muscleGroup,
      isActive: true
    }).limit(5);

    return exercises;
  } catch (error) {
    console.error('❌ Exercise recommendations error:', error);
    throw error;
  }
};

// Analyze workout performance
export const analyzePerformance = async (progressData) => {
  try {
    if (!progressData || progressData.length === 0) {
      return {
        trend: 'stable',
        message: 'Keep going! Consistency is key.',
        recommendations: ['Try increasing weight by 2.5kg', 'Focus on form']
      };
    }

    const lastWeek = progressData.slice(-7);
    const previousWeek = progressData.slice(-14, -7);

    const lastWeekAvg = lastWeek.reduce((sum, p) => sum + p.volume, 0) / lastWeek.length;
    const previousWeekAvg = previousWeek.reduce((sum, p) => sum + p.volume, 0) / previousWeek.length;

    let trend = 'stable';
    let message = 'You\'re maintaining your performance.';
    let recommendations = ['Focus on consistency'];

    if (lastWeekAvg > previousWeekAvg * 1.1) {
      trend = 'up';
      message = 'Great progress! You\'re getting stronger!';
      recommendations = ['Keep increasing weight gradually', 'Maintain good form'];
    } else if (lastWeekAvg < previousWeekAvg * 0.9) {
      trend = 'down';
      message = 'You might need more rest or recovery.';
      recommendations = ['Take an extra rest day', 'Reduce weight slightly', 'Focus on nutrition'];
    }

    return { trend, message, recommendations };
  } catch (error) {
    console.error('❌ Performance analysis error:', error);
    throw error;
  }
};

// Nutrition recommendations
export const getNutritionRecommendations = async (user) => {
  try {
    const { weight, height, age, goals } = user;

    // Calculate BMR (Mifflin-St Jeor)
    let bmr;
    if (user.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multiplier
    const activityMultiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * (activityMultiplier[user.activityLevel] || 1.55);

    let calorieGoal = tdee;
    let proteinGoal = 1.6 * weight;
    let carbGoal = 3 * weight;
    let fatGoal = 0.8 * weight;

    if (goals.includes('lose_weight')) {
      calorieGoal -= 500;
    } else if (goals.includes('build_muscle')) {
      calorieGoal += 300;
      proteinGoal = 2.2 * weight;
    }

    return {
      calories: Math.round(calorieGoal),
      protein: Math.round(proteinGoal),
      carbs: Math.round(carbGoal),
      fat: Math.round(fatGoal),
      water: Math.round(weight * 35),
      message: goals.includes('lose_weight') 
        ? 'Focus on high protein, moderate carbs, and healthy fats.' 
        : 'Prioritize protein and complex carbs for muscle building.'
    };
  } catch (error) {
    console.error('❌ Nutrition recommendations error:', error);
    throw error;
  }
};
