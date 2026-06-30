import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getDailyNutrition,
  logMeal,
  searchFood,
  setGoals,
  getNutritionHistory,
  deleteMeal,
  logWater,
  getMealRecommendations
} from '../controllers/nutrition.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/daily', getDailyNutrition);
router.get('/history', getNutritionHistory);
router.get('/food/search', searchFood);
router.get('/recommendations', getMealRecommendations);

router.post('/meal', logMeal);
router.post('/water', logWater);
router.put('/goals', setGoals);
router.delete('/meal/:id', deleteMeal);

export default router;
