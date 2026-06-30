import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Main Menu Keyboard
const mainMenu = Markup.inlineKeyboard([
  [Markup.button.webApp('🏋️ Open App', FRONTEND_URL)],
  [Markup.button.callback('📅 Today\'s Workout', 'today')],
  [Markup.button.callback('📊 My Progress', 'progress')],
  [Markup.button.callback('🍽️ Nutrition', 'nutrition')],
  [Markup.button.callback('🏆 Challenges', 'challenges')],
  [Markup.button.callback('🤖 AI Coach', 'coach')],
  [Markup.button.callback('⚙️ Settings', 'settings')],
  [Markup.button.callback('❓ Help', 'help')]
]);

// Start command
bot.start(async (ctx) => {
  const user = ctx.from;
  const welcomeMessage = `
🏋️ Welcome to <b>Gym Pro</b>!

Hey ${user.first_name}! I'm your personal fitness assistant. 

Here's what I can help you with:
💪 Track your workouts
📊 Monitor your progress
🍽️ Log your nutrition
🏆 Join challenges
🤖 Get AI-powered coaching

Ready to start your fitness journey?
  `;

  await ctx.replyWithHTML(welcomeMessage, mainMenu);
});

// Callback query handler
bot.on('callback_query', async (ctx) => {
  const action = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  // Try to get user from backend
  let user;
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/users/telegram/${userId}`);
    user = response.data;
  } catch (error) {
    // User not found, ask to register
    if (error.response?.status === 404) {
      await ctx.answerCbQuery();
      await ctx.replyWithHTML(
        '🔐 <b>Account Required</b>\n\n' +
        'Please open the web app to create your account first.',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open Web App', FRONTEND_URL)]
        ])
      );
      return;
    }
  }

  // Handle actions
  switch (action) {
    case 'today':
      await handleTodayWorkout(ctx, userId);
      break;
    case 'progress':
      await handleProgress(ctx, userId);
      break;
    case 'nutrition':
      await handleNutrition(ctx, userId);
      break;
    case 'challenges':
      await handleChallenges(ctx, userId);
      break;
    case 'coach':
      await handleCoach(ctx);
      break;
    case 'settings':
      await handleSettings(ctx);
      break;
    case 'help':
      await handleHelp(ctx);
      break;
    default:
      await ctx.answerCbQuery();
      await ctx.reply('Unknown command. Please use the menu.');
  }

  await ctx.answerCbQuery();
});

// Today's Workout
async function handleTodayWorkout(ctx, userId) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/workouts/today`, {
      headers: { 'x-user-id': userId }
    });

    const workout = response.data.workout;
    
    if (!workout) {
      await ctx.replyWithHTML(
        '📅 <b>Today\'s Workout</b>\n\n' +
        '🎉 You have no workout scheduled for today.\n' +
        'Take a rest day or explore other programs!',
        Markup.inlineKeyboard([
          [Markup.button.webApp('💪 Find Workouts', FRONTEND_URL)]
        ])
      );
      return;
    }

    const exercises = workout.exercises.map((ex, i) => 
      `${i + 1}. ${ex.exerciseId.name} - ${ex.sets}×${ex.reps} (${ex.weight || 0}kg)`
    ).join('\n');

    await ctx.replyWithHTML(
      `📅 <b>Today's Workout</b>\n\n` +
      `<b>${workout.name}</b>\n` +
      `⏱️ ${workout.duration || 45} min\n` +
      `📊 ${workout.exercises.length} exercises\n\n` +
      `<b>Exercises:</b>\n${exercises}\n\n` +
      `🔥 Volume: ${workout.totalVolume || 0} kg`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('💪 Start Workout', `${FRONTEND_URL}/workout/${workout._id}`)],
        [Markup.button.callback('🔙 Back to Menu', 'back')]
      ])
    );
  } catch (error) {
    console.error('Today workout error:', error);
    await ctx.reply('Error fetching today\'s workout. Please try again.');
  }
}

// Progress Handler
async function handleProgress(ctx, userId) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/progress/weekly-summary`, {
      headers: { 'x-user-id': userId }
    });

    const data = response.data;

    await ctx.replyWithHTML(
      `📊 <b>Your Weekly Progress</b>\n\n` +
      `🏋️ Workouts: ${data.totalWorkouts || 0}\n` +
      `⏱️ Total Time: ${data.totalMinutes || 0} min\n` +
      `🔥 Calories Burned: ${data.caloriesBurned || 0}\n` +
      `💪 Total Volume: ${data.totalVolume || 0} kg\n\n` +
      `📈 Streak: ${data.streak || 0} days\n` +
      `⭐ Level: ${data.level || 1}\n` +
      `🏅 XP: ${data.xp || 0}`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('📈 Detailed Stats', `${FRONTEND_URL}/progress`)],
        [Markup.button.callback('🔙 Back to Menu', 'back')]
      ])
    );
  } catch (error) {
    console.error('Progress error:', error);
    await ctx.reply('Error fetching progress. Please try again.');
  }
}

// Nutrition Handler
async function handleNutrition(ctx, userId) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/nutrition/daily`, {
      headers: { 'x-user-id': userId }
    });

    const data = response.data;

    await ctx.replyWithHTML(
      `🍽️ <b>Today's Nutrition</b>\n\n` +
      `🔥 Calories: ${data.calories || 0} / ${data.goals?.calories || 2000} kcal\n` +
      `💪 Protein: ${data.protein || 0} / ${data.goals?.protein || 150} g\n` +
      `🍞 Carbs: ${data.carbs || 0} / ${data.goals?.carbs || 250} g\n` +
      `🥑 Fat: ${data.fat || 0} / ${data.goals?.fat || 70} g\n` +
      `💧 Water: ${data.water || 0} / ${data.goals?.water || 3000} ml\n\n` +
      `${data.meals?.length > 0 ? '📝 Meals logged: ' + data.meals.length : 'No meals logged yet'}`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('🍽️ Log Meal', `${FRONTEND_URL}/nutrition`)],
        [Markup.button.callback('🔙 Back to Menu', 'back')]
      ])
    );
  } catch (error) {
    console.error('Nutrition error:', error);
    await ctx.reply('Error fetching nutrition data. Please try again.');
  }
}

// Challenges Handler
async function handleChallenges(ctx, userId) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/challenges/active`, {
      headers: { 'x-user-id': userId }
    });

    const challenges = response.data;

    if (!challenges || challenges.length === 0) {
      await ctx.replyWithHTML(
        '🏆 <b>Active Challenges</b>\n\n' +
        'No active challenges at the moment. Check back later!',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🏆 View All Challenges', `${FRONTEND_URL}/challenges`)],
          [Markup.button.callback('🔙 Back to Menu', 'back')]
        ])
      );
      return;
    }

    let message = '🏆 <b>Active Challenges</b>\n\n';
    challenges.forEach((challenge, i) => {
      message += `${i + 1}. <b>${challenge.name}</b>\n`;
      message += `   ${challenge.difficulty} • ${challenge.participants?.length || 0} participants\n`;
      message += `   Reward: ${challenge.reward || 'XP'}\n\n`;
    });

    await ctx.replyWithHTML(message, Markup.inlineKeyboard([
      [Markup.button.webApp('🏆 Join Challenges', `${FRONTEND_URL}/challenges`)],
      [Markup.button.callback('🔙 Back to Menu', 'back')]
    ]));
  } catch (error) {
    console.error('Challenges error:', error);
    await ctx.reply('Error fetching challenges. Please try again.');
  }
}

// AI Coach Handler
async function handleCoach(ctx) {
  await ctx.replyWithHTML(
    `🤖 <b>AI Fitness Coach</b>\n\n` +
    `I'm here to help you with your fitness journey!\n\n` +
    `💬 Ask me about:\n` +
    `• Workout recommendations\n` +
    `• Nutrition advice\n` +
    `• Recovery tips\n` +
    `• Exercise form\n` +
    `• Goal setting\n\n` +
    `Send me a message and I'll help you out!`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📝 Ask Question', 'ask_question')],
      [Markup.button.webApp('🎯 Set Goals', `${FRONTEND_URL}/goals`)],
      [Markup.button.callback('🔙 Back to Menu', 'back')]
    ])
  );
}

// Settings Handler
async function handleSettings(ctx) {
  await ctx.replyWithHTML(
    `⚙️ <b>Settings</b>\n\n` +
    `Manage your preferences:\n\n` +
    `👤 Profile Information\n` +
    `🔔 Notifications\n` +
    `🌐 Language\n` +
    `📐 Units (kg/lb)\n` +
    `🔒 Privacy\n` +
    `⭐ Premium Subscription`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('👤 Edit Profile', `${FRONTEND_URL}/settings`)],
      [Markup.button.callback('🔙 Back to Menu', 'back')]
    ])
  );
}

// Help Handler
async function handleHelp(ctx) {
  await ctx.replyWithHTML(
    `❓ <b>Help Center</b>\n\n` +
    `📖 <b>Frequently Asked Questions</b>\n` +
    `• How do I start a workout?\n` +
    `• How do I track my nutrition?\n` +
    `• What is the AI Coach?\n` +
    `• How do I earn XP?\n\n` +
    `📧 Contact Support\n` +
    `🐛 Report a Bug\n` +
    `📝 Send Feedback`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('📖 FAQ', `${FRONTEND_URL}/help`)],
      [Markup.button.webApp('📧 Contact Support', `${FRONTEND_URL}/support`)],
      [Markup.button.callback('🔙 Back to Menu', 'back')]
    ])
  );
}

// Back to Menu
bot.action('back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithHTML(
    '🏋️ <b>Welcome to Gym Pro!</b>\n\nSelect an option below:',
    mainMenu
  );
});

// Ask Question (AI Coach)
bot.action('ask_question', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithHTML(
    '🤖 <b>Ask Your Question</b>\n\n' +
    'Please type your fitness question below.\n' +
    'I\'ll respond with personalized advice!'
  );
});

// Handle text messages (AI Coach responses)
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Skip commands
  if (text.startsWith('/')) return;

  // Check if it's a question for AI coach
  const isQuestion = text.includes('?') || 
                     text.includes('how') || 
                     text.includes('what') ||
                     text.includes('why');

  if (isQuestion) {
    await ctx.sendChatAction('typing');
    
    // Simple AI responses
    let response = '';
    const lowerText = text.toLowerCase();

    if (lowerText.includes('workout')) {
      response = '💪 For optimal results, try a mix of compound and isolation exercises. I recommend 3-4 sets of 8-12 reps for muscle growth.';
    } else if (lowerText.includes('nutrition') || lowerText.includes('diet') || lowerText.includes('eat')) {
      response = '🍽️ Aim for 1.6-2.2g of protein per kg of body weight. Fill the rest with complex carbs and healthy fats. Stay hydrated!';
    } else if (lowerText.includes('lose') || lowerText.includes('weight')) {
      response = '🔥 To lose weight, maintain a 300-500 calorie deficit. Combine resistance training with cardio for best results.';
    } else if (lowerText.includes('muscle') || lowerText.includes('build')) {
      response = '💪 Progressive overload is key! Increase weight or reps each week. Get 7-9 hours of sleep for optimal recovery.';
    } else if (lowerText.includes('recover') || lowerText.includes('rest')) {
      response = '🛌 Rest days are crucial! Try active recovery like walking, stretching, or light yoga. Don\'t forget to hydrate!';
    } else {
      response = '🤔 That\'s a great question! For personalized advice, I recommend consulting with a fitness professional or using our AI coach in the web app.';
    }

    await ctx.replyWithHTML(
      `🤖 <b>AI Coach Response</b>\n\n${response}\n\n` +
      `💡 <i>Need more help? Open the web app for full features!</i>`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open Gym Pro', FRONTEND_URL)],
        [Markup.button.callback('🔙 Back to Menu', 'back')]
      ])
    );
  }
});

// Error handler
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('⚠️ Something went wrong. Please try again.');
});

// Start bot
bot.launch()
  .then(() => console.log('🤖 Telegram bot started successfully'))
  .catch(err => console.error('Bot launch error:', err));

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
