import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BorrowRequest, Item, User, Category } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get total counts
    const [totalCounts] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM items) as total_items,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM borrow_requests) as total_requests
    `, { type: QueryTypes.SELECT });
    
    // Get item status distribution
    const [statusDistribution] = await sequelize.query(`
      SELECT
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowed,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM items
    `, { type: QueryTypes.SELECT });
    
    // Get borrowing trends - last 30 days by day
    const borrowingTrends = await sequelize.query(`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as request_count
      FROM borrow_requests
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date
    `, { type: QueryTypes.SELECT });
    
    // Get top borrowers
    const topBorrowers = await sequelize.query(`
      SELECT
        u.id,
        u.name,
        COUNT(br.id) as borrow_count
      FROM users u
      JOIN borrow_requests br ON u.id = br."userId"
      GROUP BY u.id, u.name
      ORDER BY borrow_count DESC
      LIMIT 5
    `, { type: QueryTypes.SELECT });
    
    // Get category popularity
    const categoryPopularity = await sequelize.query(`
      SELECT
        c.id,
        c.name,
        COUNT(br.id) as borrow_count
      FROM categories c
      JOIN items i ON c.id = i."categoryId"
      JOIN borrow_requests br ON i.id = br."itemId"
      GROUP BY c.id, c.name
      ORDER BY borrow_count DESC
    `, { type: QueryTypes.SELECT });
    
    res.json({
      totalCounts,
      statusDistribution,
      borrowingTrends,
      topBorrowers,
      categoryPopularity
    });
  } catch (error: any) {
    console.error('Statistics error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics',
      error: error?.message || 'Unknown error'
    });
  }
}; 