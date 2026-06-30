import Exercise from '../models/Exercise.js';
import User from '../models/User.js';

// Get all exercises with pagination and filters
export const getExercises = async (req, res) => {
  try {
    const { page = 1, limit = 20, muscleGroup, equipment, difficulty, search } = req.query;
    const filter = { isActive: true };
    
    if (muscleGroup) filter.muscleGroup = muscleGroup;
    if (equipment) filter.equipment = equipment;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const exercises = await Exercise.find(filter)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Exercise.countDocuments(filter);

    res.json({
      exercises,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Failed to get exercises' });
  }
};

// Get single exercise by ID
export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ error: 'Failed to get exercise' });
  }
};

// Search exercises
export const searchExercises = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const exercises = await Exercise.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { muscleGroup: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .limit(20)
    .sort({ name: 1 });

    res.json(exercises);
  } catch (error) {
    console.error('Search exercises error:', error);
    res.status(500).json({ error: 'Failed to search exercises' });
  }
};

// Get exercises by muscle group
export const getExercisesByMuscleGroup = async (req, res) => {
  try {
    const { group } = req.params;
    const exercises = await Exercise.find({
      muscleGroup: group,
      isActive: true
    }).sort({ name: 1 });
    
    res.json(exercises);
  } catch (error) {
    console.error('Get exercises by muscle group error:', error);
    res.status(500).json({ error: 'Failed to get exercises' });
  }
};

// Get exercises by equipment
export const getExercisesByEquipment = async (req, res) => {
  try {
    const { equipment } = req.params;
    const exercises = await Exercise.find({
      equipment,
      isActive: true
    }).sort({ name: 1 });
    
    res.json(exercises);
  } catch (error) {
    console.error('Get exercises by equipment error:', error);
    res.status(500).json({ error: 'Failed to get exercises' });
  }
};

// Add exercise to favorites
export const addFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const user = await User.findById(userId);
    if (!user.favorites) user.favorites = [];
    
    if (!user.favorites.includes(id)) {
      user.favorites.push(id);
      await user.save();
    }

    res.json({ message: 'Exercise added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

// Remove exercise from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(fav => fav.toString() !== id);
    await user.save();

    res.json({ message: 'Exercise removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};

// Get user's favorite exercises
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites || []);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};

// Get exercise alternatives
export const getAlternatives = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const alternatives = await Exercise.find({
      muscleGroup: exercise.muscleGroup,
      _id: { $ne: id },
      isActive: true
    }).limit(5);

    res.json(alternatives);
  } catch (error) {
    console.error('Get alternatives error:', error);
    res.status(500).json({ error: 'Failed to get alternatives' });
  }
};
