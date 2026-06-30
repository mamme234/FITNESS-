// backend/src/controllers/progress.controller.js
import Progress from '../models/Progress.js';
import Workout from '../models/Workout.js';
import User from '../models/User.js';

export const getWeightProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    const progress = await Progress.find({
      userId,
      date: { $gte: startDate }
    })
    .sort({ date: 1 })
    .populate('exerciseId', 'name muscleGroup');

    res.json(progress);
  } catch (error) {
    console.error('Get weight progress error:', error);
    res.status(500).json({ error: 'Failed to get weight progress' });
  }
};

export const getVolumeProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { exerciseId, period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);

    const filter = { userId, date: { $gte: startDate } };
    if (exerciseId) filter.exerciseId = exerciseId;

    const progress = await Progress.find(filter)
      .populate('exerciseId', 'name muscleGroup')
      .sort({ date: 1 });

    res.json(progress);
  } catch (error) {
    console.error('Get volume progress error:', error);
    res.status(500).json({ error: 'Failed to get volume progress' });
  }
};

export const getPersonalRecords = async (req, res) => {
  try {
    const userId = req.user._id;

    const records = await Progress.aggregate([
      { $match: { userId: userId } },
      { $group: {
        _id: '$exerciseId',
        maxWeight: { $max: '$weight' },
        maxVolume: { $max: '$volume' },
        maxE1RM: { $max: '$e1rm' },
        bestReps: { $max: '$reps' }
      }},
      { $lookup: {
        from: 'exercises',
        localField: '_id',
        foreignField: '_id',
        as: 'exercise'
      }},
      { $unwind: '$exercise' },
      { $sort: { maxWeight: -1 } }
    ]);

    res.json(records);
  } catch (error) {
    console.error('Get personal records error:', error);
    res.status(500).json({ error: 'Failed to get personal records' });
  }
};

export const getWeeklySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({
      userId,
      isCompleted: true,
      completedAt: { $gte: startOfWeek }
    });

    const user = await User.findById(userId);

    res.json({
      totalWorkouts: workouts.length,
      totalMinutes: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      caloriesBurned: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      totalVolume: workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
      streak: user.streak || 0,
      level: user.level || 1,
      xp: user.xp || 0
    });
  } catch (error) {
    console.error('Get weekly summary error:', error);
    res.status(500).json({ error: 'Failed to get weekly summary' });
  }
};

export const getAchievements = async (req, res) => {
  try {
    // For now return empty array, achievements system can be added later
    res.json([]);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
};

export const getMuscleProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progress = await Progress.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).populate('exerciseId');

    const muscleGroups = {};
    progress.forEach(p => {
      if (p.exerciseId && p.exerciseId.muscleGroup) {
        const group = p.exerciseId.muscleGroup;
        if (!muscleGroups[group]) {
          muscleGroups[group] = { volume: 0, count: 0 };
        }
        muscleGroups[group].volume += p.volume || 0;
        muscleGroups[group].count += 1;
      }
    });

    res.json(muscleGroups);
  } catch (error) {
    console.error('Get muscle progress error:', error);
    res.status(500).json({ error: 'Failed to get muscle progress' });
  }
};

export const getCalendarData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const workouts = await Workout.find({
      userId,
      isCompleted: true,
      completedAt: { $gte: startDate, $lte: endDate }
    });

    const calendarData = {};
    workouts.forEach(w => {
      const date = w.completedAt.toISOString().split('T')[0];
      calendarData[date] = (calendarData[date] || 0) + 1;
    });

    res.json(calendarData);
  } catch (error) {
    console.error('Get calendar data error:', error);
    res.status(500).json({ error: 'Failed to get calendar data' });
  }
};
