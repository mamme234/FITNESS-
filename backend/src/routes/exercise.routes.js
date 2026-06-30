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
  getFavorites
} from '../controllers/exercise.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getExercises);
router.get('/search', searchExercises);
router.get('/muscle-group/:group', getExercisesByMuscleGroup);
router.get('/equipment/:equipment', getExercisesByEquipment);
router.get('/favorites', getFavorites);
router.get('/:id', getExerciseById);

router.post('/favorites/:id', addFavorite);
router.delete('/favorites/:id', removeFavorite);

export default router;
