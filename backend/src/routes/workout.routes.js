import express from 'express';
import { authenticate, isPremium } from '../middleware/auth.js';
import {
  getTodayWorkout,
  getWorkoutPrograms,
  getWorkoutSchedule,
  startWorkout,
  logSet,
  completeWorkout,
  getWorkoutHistory,
  getWorkoutStatistics,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout
} from '../controllers/workout.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/today', getTodayWorkout);
router.get('/programs', getWorkoutPrograms);
router.get('/schedule', getWorkoutSchedule);
router.get('/history', getWorkoutHistory);
router.get('/statistics', getWorkoutStatistics);
router.get('/:id', getWorkoutById);

router.post('/start', startWorkout);
router.post('/:id/log-set', logSet);
router.post('/:id/complete', completeWorkout);

router.post('/', createWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
