import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getExercises,
  getExerciseById,
  searchExercises,
  getExercisesByMuscleGroup,
  getExercisesByEquipment,
  addFavorite,
  removeFavorite,
  getFavorites,
  getAlternatives
} from '../controllers/exercise.controller.js';

const router = express.Router();

router.use(authenticate);

// Get exercises with filters
router.get('/', getExercises);

// Search exercises
router.get('/search', searchExercises);

// Get by muscle group
router.get('/muscle-group/:group', getExercisesByMuscleGroup);

// Get by equipment
router.get('/equipment/:equipment', getExercisesByEquipment);

// Get favorites
router.get('/favorites', getFavorites);

// Get exercise alternatives
router.get('/:id/alternatives', getAlternatives);

// Get single exercise
router.get('/:id', getExerciseById);

// Favorite routes
router.post('/favorites/:id', addFavorite);
router.delete('/favorites/:id', removeFavorite);

export default router;
