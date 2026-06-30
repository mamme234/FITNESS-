import express from 'express';
import { authenticate } from '../middleware/auth.js';
// import { upload } from '../middleware/upload.js'; // COMMENTED OUT - Add later
import {
  getProfile,
  updateProfile,
  updateMeasurements,
  // uploadAvatar, // COMMENTED OUT
  deleteAccount,
  getSettings,
  updateSettings,
  getStats
} from '../controllers/user.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/measurements', updateMeasurements);
// router.post('/avatar', upload.single('avatar'), uploadAvatar); // COMMENTED OUT
router.delete('/account', deleteAccount);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/stats', getStats);

export default router;
