import Workout from '../models/Workout.js';
import Progress from '../models/Progress.js';
import Exercise from '../models/Exercise.js';

// Calculate workout volume
export const calculateVolume = (exercises) => {
  return exercises.reduce((total, exercise) => {
    const setVolume = exercise.loggedSets?.reduce((sum, set) => {
      return sum + (set.weight || 0) * (set.reps || 0);
    }, 0) || 0;
    return total + setVolume;
  }, 0);
};

// Calculate calories burned
export const calculateCaloriesBurned = (workout) => {
  // MET values for different exercise types
  const metValues = {
    strength: 4.5,
    hypertrophy: 4.5,
    endurance: 5.5,
    power: 5.0,
    conditioning: 6.0,
    cardio: 7.0
  };

  const met = metValues[workout.type] || 4.5;
  const duration = workout.duration || 45;
  const weight = workout.userId?.weight || 70;

  // Calories = MET × weight (kg) × duration (hours)
  return Math.round(met * weight * (duration / 60));
};

// Get next workout in program
export const getNextWorkout = async (userId, programId) => {
  try {
    const workouts = await Workout.find({
      userId,
      programId,
      isCompleted: true
    }).sort({ completedAt: -1 });

    const lastWorkout = workouts[0];
    if (!lastWorkout) {
      return await Workout.findOne({ userId, programId, isCompleted: false });
    }

    // Get next workout based on schedule
    const allWorkouts = await Workout.find({ userId, programId }).sort({ createdAt: 1 });
    const currentIndex = allWorkouts.findIndex(w => w._id.equals(lastWorkout._id));
    
    return allWorkouts[currentIndex + 1] || null;
  } catch (error) {
    console.error('❌ Get next workout error:', error);
    throw error;
  }
};

// Calculate progression
export const calculateProgression = async (userId, exerciseId) => {
  try {
    const progress = await Progress.find({
      userId,
      exerciseId
    }).sort({ date: -1 }).limit(10);

    if (progress.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        percentage: 0
      };
    }

    const latest = progress[0].weight;
    const previous = progress[progress.length - 1].weight;

    const change = latest - previous;
    const percentage = previous > 0 ? (change / previous) * 100 : 0;

    return {
      trend: change > 0 ? 'up' : (change < 0 ? 'down' : 'stable'),
      change: Math.abs(change),
      percentage: Math.abs(percentage)
    };
  } catch (error) {
    console.error('❌ Calculate progression error:', error);
    throw error;
  }
};
