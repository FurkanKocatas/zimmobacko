import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import os from 'os';
import { archiveOldBorrowRequests } from '../utils/cleanup';

// Define an interface for the database size query result
interface DbSizeResult {
  size: string;
}

export const getSystemHealth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check database connection
    const dbStatus = await sequelize.authenticate()
      .then(() => ({ status: 'ok', message: 'Connected to database' }))
      .catch(err => ({ status: 'error', message: `Database connection failed: ${err.message}` }));
    
    // Check database size with proper typing
    const [dbSize] = await sequelize.query<DbSizeResult>(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `, { type: QueryTypes.SELECT });
    
    // System info
    const systemInfo = {
      platform: os.platform(),
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB',
        free: Math.round(os.freemem() / (1024 * 1024 * 1024)) + ' GB',
        usage: Math.round((1 - os.freemem() / os.totalmem()) * 100) + '%'
      },
      uptime: Math.round(os.uptime() / 3600) + ' hours',
      cpus: os.cpus().length
    };
    
    res.json({
      timestamp: new Date(),
      database: {
        status: dbStatus.status,
        message: dbStatus.message,
        size: dbSize?.size || 'Unknown'  // Add fallback in case dbSize is undefined
      },
      system: systemInfo
    });
  } catch (error: any) {
    console.error('System health check error:', error);
    res.status(500).json({ 
      message: 'Failed to check system health',
      error: error?.message 
    });
  }
};

export const runCleanup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await archiveOldBorrowRequests();
    
    res.json({ message: 'Cleanup completed successfully' });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      message: 'Failed to run cleanup',
      error: error?.message 
    });
  }
}; 