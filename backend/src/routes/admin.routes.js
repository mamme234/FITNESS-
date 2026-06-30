// backend/src/routes/admin.routes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  banUser,
  unbanUser,
  createExercise,
  updateExercise,
  deleteExercise,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  sendNotification,
  getLogs,
  getAnalytics
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);

router.post('/exercises', createExercise);
router.put('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);

router.post('/workouts', createWorkout);
router.put('/workouts/:id', updateWorkout);
router.delete('/workouts/:id', deleteWorkout);

router.post('/notifications', sendNotification);
router.get('/logs', getLogs);
router.get('/analytics', getAnalytics);

export default router;
