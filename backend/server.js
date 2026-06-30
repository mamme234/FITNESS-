import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';

// Import Routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import workoutRoutes from './src/routes/workout.routes.js';
import exerciseRoutes from './src/routes/exercise.routes.js';
import progressRoutes from './src/routes/progress.routes.js';
import nutritionRoutes from './src/routes/nutrition.routes.js';
import challengeRoutes from './src/routes/challenge.routes.js';
import communityRoutes from './src/routes/community.routes.js';

// Import Middleware
import { errorHandler } from './src/middleware/errorHandler.js';
import { rateLimiter } from './src/middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Connect to MongoDB
await connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Gym Pro API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      workouts: '/api/v1/workouts',
      exercises: '/api/v1/exercises',
      progress: '/api/v1/progress',
      nutrition: '/api/v1/nutrition',
      challenges: '/api/v1/challenges',
      community: '/api/v1/community'
    },
    health: '/health'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/nutrition', nutritionRoutes);
app.use('/api/v1/challenges', challengeRoutes);
app.use('/api/v1/community', communityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🏋️  GYM PRO BACKEND');
  console.log('═══════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base: http://localhost:${PORT}/api/v1`);
  console.log('═══════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

export default app;
