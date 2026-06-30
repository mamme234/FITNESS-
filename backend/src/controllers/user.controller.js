import User from '../models/User.js';
// import cloudinary from '../config/cloudinary.js'; // COMMENTED OUT

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'gender', 'age', 'fitnessLevel', 'goals', 'activityLevel', 'experience'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const updateMeasurements = async (req, res) => {
  try {
    const { height, weight } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { height, weight },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update measurements error:', error);
    res.status(500).json({ error: 'Failed to update measurements' });
  }
};

// COMMENTED OUT - Add later when cloudinary is fully configured
/*
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.avatar = req.file.path;
    await user.save();

    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar: user.avatar 
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};
*/

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.deleteOne();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    res.json(user.preferences || {});
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true }
    ).select('preferences');

    res.json(user.preferences);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const getStats = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      isPremium: user.isPremium,
      xpToNextLevel: 500 - (user.xp % 500)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
