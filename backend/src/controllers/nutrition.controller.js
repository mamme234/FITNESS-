import Nutrition from '../models/Nutrition.js';

// Get today's nutrition
export const getDailyNutrition = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nutrition = await Nutrition.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!nutrition) {
      nutrition = new Nutrition({
        userId,
        date: today,
        meals: [],
        water: 0,
        goals: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 70,
          water: 3000
        }
      });
      await nutrition.save();
    }

    res.json(nutrition);
  } catch (error) {
    console.error('Get daily nutrition error:', error);
    res.status(500).json({ error: 'Failed to get daily nutrition' });
  }
};

// Log a meal
export const logMeal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, name, calories, protein, carbs, fat, fiber, sugar, sodium, ingredients, preparation } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nutrition = await Nutrition.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!nutrition) {
      nutrition = new Nutrition({
        userId,
        date: today,
        meals: [],
        water: 0,
        goals: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 70,
          water: 3000
        }
      });
    }

    nutrition.meals.push({
      type,
      name,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
      sugar: sugar || 0,
      sodium: sodium || 0,
      ingredients: ingredients || [],
      preparation: preparation || '',
      timestamp: new Date()
    });

    await nutrition.save();
    res.json({ message: 'Meal logged successfully', nutrition });
  } catch (error) {
    console.error('Log meal error:', error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
};

// Log water intake
export const logWater = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nutrition = await Nutrition.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!nutrition) {
      nutrition = new Nutrition({
        userId,
        date: today,
        meals: [],
        water: 0,
        goals: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 70,
          water: 3000
        }
      });
    }

    nutrition.water += amount;
    await nutrition.save();

    res.json({ message: 'Water logged successfully', water: nutrition.water });
  } catch (error) {
    console.error('Log water error:', error);
    res.status(500).json({ error: 'Failed to log water' });
  }
};

// Search food database
export const searchFood = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Basic food database
    const foodDatabase = [
      { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
      { name: 'Rice (White)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: '100g' },
      { name: 'Rice (Brown)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: '100g' },
      { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: '100g' },
      { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: '100g' },
      { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, unit: '100g' },
      { name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 13, unit: '100g' },
      { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, unit: '100g' },
      { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: '100g' },
      { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: '100g' },
      { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: '100g' },
      { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 49, unit: '100g' },
      { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: '100g' },
      { name: 'Tuna', calories: 132, protein: 28, carbs: 0, fat: 1.3, unit: '100g' },
      { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, unit: '100g' },
      { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 0.8, unit: '100g' },
      { name: 'Whey Protein', calories: 110, protein: 24, carbs: 2, fat: 1, unit: '30g' },
      { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1, unit: '100ml' },
      { name: 'Almond Milk', calories: 17, protein: 0.6, carbs: 1.3, fat: 1.1, unit: '100ml' },
      { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, unit: '100g' },
    ];

    const results = foodDatabase.filter(food =>
      food.name.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 10);

    res.json(results);
  } catch (error) {
    console.error('Search food error:', error);
    res.status(500).json({ error: 'Failed to search food' });
  }
};

// Set nutrition goals
export const setGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { calories, protein, carbs, fat, water } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nutrition = await Nutrition.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!nutrition) {
      nutrition = new Nutrition({
        userId,
        date: today,
        meals: [],
        water: 0,
        goals: {}
      });
    }

    nutrition.goals = {
      calories: calories || 2000,
      protein: protein || 150,
      carbs: carbs || 250,
      fat: fat || 70,
      water: water || 3000
    };
    await nutrition.save();

    res.json({ message: 'Goals updated successfully', goals: nutrition.goals });
  } catch (error) {
    console.error('Set goals error:', error);
    res.status(500).json({ error: 'Failed to set goals' });
  }
};

// Get nutrition history
export const getNutritionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const history = await Nutrition.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json(history);
  } catch (error) {
    console.error('Get nutrition history error:', error);
    res.status(500).json({ error: 'Failed to get nutrition history' });
  }
};

// Delete a meal
export const deleteMeal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const nutrition = await Nutrition.findOne({ userId });
    if (!nutrition) {
      return res.status(404).json({ error: 'Nutrition record not found' });
    }

    nutrition.meals = nutrition.meals.filter(meal => meal._id.toString() !== id);
    await nutrition.save();

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};

// Get meal recommendations
export const getMealRecommendations = async (req, res) => {
  try {
    const meals = [
      {
        type: 'breakfast',
        name: 'Oatmeal with Berries',
        calories: 350,
        protein: 15,
        carbs: 45,
        fat: 8,
        ingredients: ['Oats', 'Berries', 'Milk', 'Honey'],
        preparation: 'Mix oats with milk, top with berries and honey.'
      },
      {
        type: 'breakfast',
        name: 'Protein Pancakes',
        calories: 400,
        protein: 30,
        carbs: 35,
        fat: 10,
        ingredients: ['Protein Powder', 'Eggs', 'Oats', 'Banana'],
        preparation: 'Blend all ingredients, cook on pan until golden.'
      },
      {
        type: 'lunch',
        name: 'Chicken Rice Bowl',
        calories: 550,
        protein: 40,
        carbs: 60,
        fat: 12,
        ingredients: ['Chicken', 'Rice', 'Broccoli', 'Sauce'],
        preparation: 'Grill chicken, serve with rice and steamed broccoli.'
      },
      {
        type: 'lunch',
        name: 'Tuna Salad',
        calories: 350,
        protein: 35,
        carbs: 15,
        fat: 15,
        ingredients: ['Tuna', 'Lettuce', 'Tomato', 'Olive Oil'],
        preparation: 'Mix tuna with vegetables, drizzle with olive oil.'
      },
      {
        type: 'dinner',
        name: 'Salmon with Vegetables',
        calories: 500,
        protein: 35,
        carbs: 30,
        fat: 20,
        ingredients: ['Salmon', 'Asparagus', 'Sweet Potato'],
        preparation: 'Bake salmon, roast sweet potato and asparagus.'
      },
      {
        type: 'dinner',
        name: 'Lean Steak with Greens',
        calories: 550,
        protein: 45,
        carbs: 25,
        fat: 22,
        ingredients: ['Steak', 'Spinach', 'Mushrooms', 'Garlic'],
        preparation: 'Grill steak, sauté spinach and mushrooms with garlic.'
      },
      {
        type: 'snack',
        name: 'Protein Smoothie',
        calories: 200,
        protein: 25,
        carbs: 15,
        fat: 5,
        ingredients: ['Protein Powder', 'Banana', 'Milk', 'Peanut Butter'],
        preparation: 'Blend all ingredients until smooth.'
      },
      {
        type: 'snack',
        name: 'Greek Yogurt with Berries',
        calories: 150,
        protein: 15,
        carbs: 12,
        fat: 5,
        ingredients: ['Greek Yogurt', 'Berries', 'Honey'],
        preparation: 'Mix yogurt with berries, drizzle with honey.'
      }
    ];

    res.json(meals);
  } catch (error) {
    console.error('Get meal recommendations error:', error);
    res.status(500).json({ error: 'Failed to get meal recommendations' });
  }
};
