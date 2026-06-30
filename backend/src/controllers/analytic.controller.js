import Progress from '../models/Progress.js';
import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import User from '../models/User.js';

export const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [workouts, progress, nutrition] = await Promise.all([
      Workout.find({ userId, isCompleted: true, completedAt: { $gte: thirtyDaysAgo } }),
      Progress.find({ userId, date: { $gte: thirtyDaysAgo } }),
      Nutrition.findOne({ userId, date: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      totalWorkouts: workouts.length,
      totalVolume: workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      totalExercises: progress.length,
      avgNutrition: nutrition ? {
        calories: nutrition.calories || 0,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0
      } : null
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Failed to get overview' });
  }
};

export const getWorkoutAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    const workouts = await Workout.find({
      userId,
      isCompleted: true,
      completedAt: { $gte: startDate }
    }).sort({ completedAt: 1 });

    const byDate = {};
    const byType = {};
    let totalVolume = 0;
    let totalCalories = 0;

    workouts.forEach(w => {
      const date = w.completedAt.toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
      byType[w.type] = (byType[w.type] || 0) + 1;
      totalVolume += w.totalVolume || 0;
      totalCalories += w.caloriesBurned || 0;
    });

    res.json({
      totalWorkouts: workouts.length,
      totalVolume,
      totalCalories,
      averageVolume: workouts.length > 0 ? totalVolume / workouts.length : 0,
      byDate,
      byType,
      trend: workouts.length > 0 ? 'up' : 'stable'
    });
  } catch (error) {
    console.error('Get workout analytics error:', error);
    res.status(500).json({ error: 'Failed to get workout analytics' });
  }
};

export const getNutritionAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);

    const nutrition = await Nutrition.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const byDate = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    nutrition.forEach(n => {
      const date = n.date.toISOString().split('T')[0];
      byDate[date] = {
        calories: n.calories || 0,
        protein: n.protein || 0,
        carbs: n.carbs || 0,
        fat: n.fat || 0
      };
      totalCalories += n.calories || 0;
      totalProtein += n.protein || 0;
      totalCarbs += n.carbs || 0;
      totalFat += n.fat || 0;
    });

    const count = nutrition.length || 1;
    res.json({
      totalDays: nutrition.length,
      averageCalories: totalCalories / count,
      averageProtein: totalProtein / count,
      averageCarbs: totalCarbs / count,
      averageFat: totalFat / count,
      byDate
    });
  } catch (error) {
    console.error('Get nutrition analytics error:', error);
    res.status(500).json({ error: 'Failed to get nutrition analytics' });
  }
};

export const getPerformanceReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get best exercises
    const bestExercises = await Progress.aggregate([
      { $match: { userId, date: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: '$exerciseId',
        maxWeight: { $max: '$weight' },
        maxVolume: { $max: '$volume' },
        count: { $sum: 1 }
      }},
      { $sort: { maxVolume: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'exercises',
        localField: '_id',
        foreignField: '_id',
        as: 'exercise'
      }},
      { $unwind: '$exercise' }
    ]);

    // Get weekly progress
    const weeklyProgress = await Progress.aggregate([
      { $match: { userId, date: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $week: '$date' },
        totalVolume: { $sum: '$volume' },
        totalWeight: { $sum: '$weight' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      bestExercises,
      weeklyProgress,
      totalProgress: await Progress.countDocuments({ userId })
    });
  } catch (error) {
    console.error('Get performance report error:', error);
    res.status(500).json({ error: 'Failed to get performance report' });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const workouts = await Workout.find({
      userId,
      isCompleted: true,
      completedAt: { $gte: startDate, $lte: endDate }
    });

    const nutrition = await Nutrition.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    res.json({
      month: parseInt(month),
      year: parseInt(year),
      totalWorkouts: workouts.length,
      totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      totalVolume: workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
      nutritionDays: nutrition.length,
      avgCalories: nutrition.length > 0 ? nutrition.reduce((sum, n) => sum + (n.calories || 0), 0) / nutrition.length : 0
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Failed to get monthly report' });
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const workouts = await Workout.find({
      userId,
      isCompleted: true,
      completedAt: { $gte: startDate, $lte: endDate }
    });

    const monthlyData = {};
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      const monthWorkouts = workouts.filter(w => 
        w.completedAt >= monthStart && w.completedAt <= monthEnd
      );
      monthlyData[i + 1] = {
        totalWorkouts: monthWorkouts.length,
        totalVolume: monthWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0)
      };
    }

    res.json({
      year: parseInt(year),
      totalWorkouts: workouts.length,
      totalVolume: workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
      monthlyData
    });
  } catch (error) {
    console.error('Get yearly report error:', error);
    res.status(500).json({ error: 'Failed to get yearly report' });
  }
};
