import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getChallenges,
  getChallengeById,
  joinChallenge,
  getChallengeProgress,
  getLeaderboard,
  completeChallenge,
  getMyChallenges
} from '../controllers/challenge.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getChallenges);
router.get('/my', getMyChallenges);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getChallengeById);
router.get('/:id/progress', getChallengeProgress);

router.post('/:id/join', joinChallenge);
router.post('/:id/complete', completeChallenge);

export default router;
