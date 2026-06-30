import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

export const getChallenges = async (req, res) => {
  try {
    const { type, difficulty, isActive = true } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive === 'true') {
      filter.isActive = true;
      filter.endDate = { $gte: new Date() };
    }

    const challenges = await Challenge.find(filter)
      .sort({ startDate: -1 })
      .limit(20);

    res.json(challenges);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
};

export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ error: 'Failed to get challenge' });
  }
};

export const joinChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const alreadyJoined = challenge.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ error: 'Already joined this challenge' });
    }

    challenge.participants.push({ userId, progress: 0, isCompleted: false });
    await challenge.save();

    res.json({ message: 'Successfully joined challenge', challenge });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
};

export const getChallengeProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const participant = challenge.participants.find(
      p => p.userId.toString() === userId.toString()
    );

    if (!participant) {
      return res.status(404).json({ error: 'You have not joined this challenge' });
    }

    res.json({
      progress: participant.progress,
      target: challenge.targetValue,
      isCompleted: participant.isCompleted,
      completedAt: participant.completedAt
    });
  } catch (error) {
    console.error('Get challenge progress error:', error);
    res.status(500).json({ error: 'Failed to get challenge progress' });
  }
};

export const completeChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const participant = challenge.participants.find(
      p => p.userId.toString() === userId.toString()
    );

    if (!participant) {
      return res.status(404).json({ error: 'You have not joined this challenge' });
    }

    if (participant.isCompleted) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }

    participant.isCompleted = true;
    participant.completedAt = new Date();

    // Award XP to user
    const user = req.user;
    user.xp += challenge.rewardXp || 100;
    
    const newLevel = Math.floor(user.xp / 500) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    await user.save();
    await challenge.save();

    res.json({
      message: 'Challenge completed successfully!',
      xpEarned: challenge.rewardXp || 100
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const challenges = await Challenge.find({ 'participants.isCompleted': true })
      .populate('participants.userId', 'name avatar');

    const leaderboard = [];
    challenges.forEach(challenge => {
      challenge.participants.forEach(participant => {
        if (participant.isCompleted && participant.userId) {
          leaderboard.push({
            userId: participant.userId._id,
            name: participant.userId.name,
            avatar: participant.userId.avatar,
            challenge: challenge.name,
            completedAt: participant.completedAt
          });
        }
      });
    });

    leaderboard.sort((a, b) => a.completedAt - b.completedAt);

    res.json(leaderboard.slice(0, 100));
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

export const getMyChallenges = async (req, res) => {
  try {
    const userId = req.user._id;

    const challenges = await Challenge.find({
      'participants.userId': userId
    });

    const myChallenges = challenges.map(challenge => {
      const participant = challenge.participants.find(
        p => p.userId.toString() === userId.toString()
      );
      return {
        ...challenge.toObject(),
        myProgress: participant ? participant.progress : 0,
        myStatus: participant ? (participant.isCompleted ? 'completed' : 'active') : 'not_joined'
      };
    });

    res.json(myChallenges);
  } catch (error) {
    console.error('Get my challenges error:', error);
    res.status(500).json({ error: 'Failed to get my challenges' });
  }
};
