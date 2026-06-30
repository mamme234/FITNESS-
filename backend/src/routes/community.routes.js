import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getPosts,
  createPost,
  getPostById,
  addComment,
  deleteComment,
  likePost,
  unlikePost,
  getFeed,
  followUser,
  unfollowUser,
  getFollowing
} from '../controllers/community.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/feed', getFeed);
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);

router.post('/posts', createPost);
router.post('/posts/:id/comment', addComment);
router.post('/posts/:id/like', likePost);
router.delete('/posts/:id/like', unlikePost);
router.delete('/posts/:id/comment/:commentId', deleteComment);

router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);
router.get('/following', getFollowing);

export default router;
