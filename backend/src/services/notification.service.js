import axios from 'axios';
import User from '../models/User.js';

// Send push notification
export const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.expoPushToken) return;

    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: user.expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    });

    console.log(`✅ Push notification sent to ${userId}`);
  } catch (error) {
    console.error('❌ Push notification error:', error);
  }
};

// Send workout reminder
export const sendWorkoutReminder = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const message = `💪 Don't forget your workout today! You're doing great!`;
    
    // Send push notification
    await sendPushNotification(userId, 'Workout Reminder', message);

    console.log(`✅ Workout reminder sent to ${userId}`);
  } catch (error) {
    console.error('❌ Workout reminder error:', error);
  }
};

// Send nutrition reminder
export const sendNutritionReminder = async (userId) => {
  try {
    const message = `🍽️ Time to log your meal! Stay on track with your nutrition goals.`;
    
    await sendPushNotification(userId, 'Nutrition Reminder', message);

    console.log(`✅ Nutrition reminder sent to ${userId}`);
  } catch (error) {
    console.error('❌ Nutrition reminder error:', error);
  }
};

// Send achievement notification
export const sendAchievementNotification = async (userId, achievement) => {
  try {
    const message = `🎉 You unlocked "${achievement}"! Keep up the great work!`;
    
    await sendPushNotification(userId, 'Achievement Unlocked', message);

    console.log(`✅ Achievement notification sent to ${userId}`);
  } catch (error) {
    console.error('❌ Achievement notification error:', error);
  }
};

// Send challenge notification
export const sendChallengeNotification = async (userId, challengeName) => {
  try {
    const message = `🏆 New challenge "${challengeName}" is now active! Join now and earn rewards!`;
    
    await sendPushNotification(userId, 'New Challenge', message);

    console.log(`✅ Challenge notification sent to ${userId}`);
  } catch (error) {
    console.error('❌ Challenge notification error:', error);
  }
};
