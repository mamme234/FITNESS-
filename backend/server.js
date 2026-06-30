import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import workoutRoutes from './src/routes/workout.routes.js';
import exerciseRoutes from './src/routes/exercise.routes.js';
import progressRoutes from './src/routes/progress.routes.js';
import nutritionRoutes from './src/routes/nutrition.routes.js';
import challengeRoutes from './src/routes/challenge.routes.js';
import communityRoutes from './src/routes/community.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { rateLimiter } from './src/middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/nutrition', nutritionRoutes);
app.use('/api/v1/challenges', challengeRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
});

export default app;
