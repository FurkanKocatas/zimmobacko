import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database';
import * as models from './models';
import testRoutes from './routes/test.routes';
import authRoutes from './routes/auth.routes';
import itemRoutes from './routes/item.routes';
import borrowRoutes from './routes/borrow.routes';
import router from './routes/index';
import path from 'path';
import { migrateMaintenanceLogs } from './migrations/create-maintenance-logs';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Asset Borrowing System API' });
});

// Add test routes
app.use('/test', testRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/borrow', borrowRoutes);

// Use the main router
app.use('/api', router);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join admin room
  socket.on('joinAdminRoom', () => {
    socket.join('admins');
    console.log(`Socket ${socket.id} joined admin room`);
  });
  
  // Join user room
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Socket ${socket.id} joined user-${userId} room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // In production, use migrations instead
    await migrateMaintenanceLogs(); // Run our custom migration
    console.log('Database connection established and models synchronized successfully.');
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

// Export io for use in controllers
export { io }; 