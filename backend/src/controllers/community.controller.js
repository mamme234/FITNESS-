import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const posts = await CommunityPost.find({ isPublic: true })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await CommunityPost.countDocuments({ isPublic: true });

    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id)
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, images, video, type, workoutId, challengeId, isPublic } = req.body;

    const post = new CommunityPost({
      userId: req.user._id,
      content,
      images: images || [],
      video,
      type: type || 'progress',
      workoutId,
      challengeId,
      isPublic: isPublic !== undefined ? isPublic : true
    });

    await post.save();
    await post.populate('userId', 'name avatar');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      userId: req.user._id,
      content
    });

    await post.save();
    await post.populate('comments.userId', 'name avatar');

    res.json(post);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const alreadyLiked = post.likes.some(
      like => like.userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({ error: 'Already liked' });
    }

    post.likes.push({ userId: req.user._id });
    await post.save();

    res.json({ message: 'Post liked', likes: post.likes.length });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.likes = post.likes.filter(
      like => like.userId.toString() !== req.user._id.toString()
    );
    await post.save();

    res.json({ message: 'Post unliked', likes: post.likes.length });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
};

export const getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const following = user.following || [];

    const posts = await CommunityPost.find({
      userId: { $in: [...following, req.user._id] },
      isPublic: true
    })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];

    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Already following' });
    }

    currentUser.following.push(userId);
    userToFollow.followers.push(req.user._id);

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.user._id);
    const userToUnfollow = await User.findById(userId);

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.following) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userId
      );
    }
    
    if (userToUnfollow.followers) {
      userToUnfollow.followers = userToUnfollow.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    }

    await Promise.all([currentUser.save(), userToUnfollow.save()]);

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'name avatar');

    res.json(user.following || []);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
};
