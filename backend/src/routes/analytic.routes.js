import express from 'express';
import { authenticate, isPremium } from '../middleware/auth.js';
import {
  getOverview,
  getWorkoutAnalytics,
  getNutritionAnalytics,
  getPerformanceReport,
  getMonthlyReport,
  getYearlyReport
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(isPremium); // Premium feature

router.get('/overview', getOverview);
router.get('/workout', getWorkoutAnalytics);
router.get('/nutrition', getNutritionAnalytics);
router.get('/performance', getPerformanceReport);
router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);

export default router;
