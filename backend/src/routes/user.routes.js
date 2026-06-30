import express from 'express';
import { authenticate } from '../middleware/auth.js';
// import { upload } from '../middleware/upload.js';  // COMMENT THIS OUT
import {
  getProfile,
  updateProfile,
  updateMeasurements,
  // uploadAvatar,  // COMMENT THIS OUT
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
// router.post('/avatar', upload.single('avatar'), uploadAvatar);  // COMMENT THIS OUT
router.delete('/account', deleteAccount);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/stats', getStats);

export default router;
