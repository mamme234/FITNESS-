import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getWeightProgress,
  getVolumeProgress,
  getPersonalRecords,
  getWeeklySummary,
  getAchievements,
  getMuscleProgress,
  getCalendarData
} from '../controllers/progress.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/weight', getWeightProgress);
router.get('/volume', getVolumeProgress);
router.get('/records', getPersonalRecords);
router.get('/weekly-summary', getWeeklySummary);
router.get('/achievements', getAchievements);
router.get('/muscle', getMuscleProgress);
router.get('/calendar', getCalendarData);

export default router;
