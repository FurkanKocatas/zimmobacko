import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BorrowRequest, Item, User, Category } from '../models';
import { Op } from 'sequelize';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Total counts
    const totalItems = await Item.count();
    const totalCategories = await Category.count();
    const totalUsers = await User.count();
    
    // Status counts
    const availableItems = await Item.count({ where: { status: 'available' } });
    const borrowedItems = await Item.count({ where: { status: 'borrowed' } });
    const maintenanceItems = await Item.count({ where: { status: 'maintenance' } });
    
    // Borrow request counts
    const pendingRequests = await BorrowRequest.count({ where: { status: 'pending' } });
    const approvedRequests = await BorrowRequest.count({ where: { status: 'approved' } });
    
    // Recent activity
    const recentActivities = await BorrowRequest.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ]
    });
    
    res.json({
      counts: {
        totalItems,
        totalCategories,
        totalUsers,
        availableItems,
        borrowedItems,
        maintenanceItems,
        pendingRequests,
        approvedRequests
      },
      recentActivities
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard data',
      error: error?.message || 'Unknown error'
    });
  }
}; 