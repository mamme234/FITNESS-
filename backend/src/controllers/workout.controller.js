import Workout from '../models/Workout.js';
import Progress from '../models/Progress.js';
import Exercise from '../models/Exercise.js';
import User from '../models/User.js';

export const getTodayWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    const workout = await Workout.findOne({
      userId,
      scheduledDays: today.getDay(),
      isCompleted: false
    }).populate('exercises.exerciseId');

    if (!workout) {
      return res.json({ 
        message: 'No workout scheduled for today',
        workout: null 
      });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get today workout error:', error);
    res.status(500).json({ error: 'Failed to get today\'s workout' });
  }
};

export const getWorkoutPrograms = async (req, res) => {
  try {
    const { type, difficulty } = req.query;
    const filter = { isTemplate: true };
    
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    const programs = await Workout.find(filter)
      .populate('exercises.exerciseId')
      .limit(20);

    res.json(programs);
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ error: 'Failed to get workout programs' });
  }
};

export const getWorkoutSchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const workouts = await Workout.find({
      userId,
      scheduledDays: { $exists: true },
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('exercises.exerciseId');

    const schedule = workouts.reduce((acc, workout) => {
      workout.scheduledDays.forEach(day => {
        if (!acc[day]) acc[day] = [];
        acc[day].push(workout);
      });
      return acc;
    }, {});

    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to get workout schedule' });
  }
};

export const startWorkout = async (req, res) => {
  try {
    const { workoutId } = req.body;
    let workout;

    if (workoutId) {
      workout = await Workout.findById(workoutId);
      if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
      }
      if (workout.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else {
      // Create a new workout session
      workout = new Workout({
        userId: req.user._id,
        ...req.body,
        isCompleted: false
      });
    }

    // Initialize logged sets
    workout.exercises.forEach(exercise => {
      exercise.loggedSets = Array.from({ length: exercise.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: exercise.reps,
        weight: exercise.weight || 0,
        isCompleted: false
      }));
    });

    await workout.save();

    res.json({ 
      message: 'Workout started',
      workout 
    });
  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({ error: 'Failed to start workout' });
  }
};

export const logSet = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { exerciseIndex, setNumber, reps, weight, rpe } = req.body;

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const exercise = workout.exercises[exerciseIndex];
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const set = exercise.loggedSets.find(s => s.setNumber === setNumber);
    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    set.reps = reps;
    set.weight = weight;
    set.rpe = rpe;
    set.isCompleted = true;
    set.timestamp = new Date();

    // Save progress
    const progress = new Progress({
      userId: req.user._id,
      exerciseId: exercise.exerciseId,
      workoutId: workout._id,
      weight,
      reps,
      sets: 1,
      rpe
    });
    await progress.save();

    // Check if all sets are completed
    const allCompleted = workout.exercises.every(e => 
      e.loggedSets.every(s => s.isCompleted)
    );

    if (allCompleted) {
      workout.isCompleted = true;
      workout.completedAt = new Date();
      
      // Update user streak
      const user = req.user;
      user.streak += 1;
      
      // Add XP
      const xpGain = workout.exercises.reduce((total, e) => {
        return total + (e.loggedSets.filter(s => s.isCompleted).length * 10);
      }, 0);
      user.xp += xpGain;
      
      // Check level up
      const newLevel = Math.floor(user.xp / 500) + 1;
      if (newLevel > user.level) {
        user.level = newLevel;
      }
      
      await user.save();
    }

    await workout.save();

    res.json({ 
      message: 'Set logged successfully',
      workout,
      isCompleted: allCompleted
    });
  } catch (error) {
    console.error('Log set error:', error);
    res.status(500).json({ error: 'Failed to log set' });
  }
};

export const completeWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    workout.isCompleted = true;
    workout.completedAt = new Date();
    await workout.save();

    // Update user stats
    const user = req.user;
    user.xp += 50; // Completion bonus
    user.streak += 1;
    
    const newLevel = Math.floor(user.xp / 500) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    await user.save();

    res.json({ 
      message: 'Workout completed successfully',
      workout 
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Failed to complete workout' });
  }
};

export const getWorkoutHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, offset = 0 } = req.query;

    const workouts = await Workout.find({
      userId,
      isCompleted: true
    })
    .sort({ completedAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .populate('exercises.exerciseId');

    const total = await Workout.countDocuments({
      userId,
      isCompleted: true
    });

    res.json({
      workouts,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ error: 'Failed to get workout history' });
  }
};

export const getWorkoutStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts = await Workout.find({
      userId,
      isCompleted: true,
      completedAt: { $gte: thirtyDaysAgo }
    });

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    
    const averageDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts || 0;

    const byType = {};
    workouts.forEach(w => {
      byType[w.type] = (byType[w.type] || 0) + 1;
    });

    res.json({
      totalWorkouts,
      totalVolume,
      totalCalories,
      averageDuration,
      byType,
      trend: workouts.length > 0 ? 'up' : 'stable'
    });
  } catch (error) {
    console.error('Get workout statistics error:', error);
    res.status(500).json({ error: 'Failed to get workout statistics' });
  }
};

export const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id)
      .populate('exercises.exerciseId');

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.userId.toString() !== req.user._id.toString() && !workout.isTemplate) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Failed to get workout' });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const workout = new Workout({
      userId: req.user._id,
      ...req.body
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(workout, req.body);
    await workout.save();

    res.json(workout);
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
};
