import { Response } from 'express';
import { BorrowRequest, Item, User, Category } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../app'; // You'll need to export io from app.ts

export const createBorrowRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId, userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ message: 'userId is required' });
      return;
    }

    console.log('Creating borrow request:', { itemId, userId });

    // Check if item exists and is available
    const item = await Item.findByPk(itemId, {
      include: [Category]
    });
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (item.status !== 'available') {
      res.status(400).json({ message: 'Item is not available for borrowing' });
      return;
    }

    // Get user info
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Create borrow request
    const borrowRequest = await BorrowRequest.create({
      userId,
      itemId,
      status: 'pending',
      borrowDate: new Date()
    });

    // Update item status to borrowed
    await item.update({ status: 'borrowed' });

    // Prepare notification data
    const notificationData = {
      id: borrowRequest.id,
      item: {
        id: item.id,
        name: item.name,
        category: item.Category ? item.Category.name : null
      },
      user: {
        id: user.id,
        name: user.name
      },
      timestamp: new Date()
    };

    // Notify admins about new request
    io.to('admins').emit('newBorrowRequest', notificationData);

    res.status(201).json(borrowRequest);
  } catch (error: any) {
    console.error('Create borrow request error:', error);
    res.status(500).json({ 
      message: 'Failed to create borrow request',
      error: error?.message || 'Unknown error'
    });
  }
};

export const approveBorrowRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const borrowRequest = await BorrowRequest.findByPk(id, {
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ]
    });

    if (!borrowRequest) {
      res.status(404).json({ message: 'Borrow request not found' });
      return;
    }

    await borrowRequest.update({ status: 'approved' });
    
    // Get the associated item and update it
    const item = await Item.findByPk(borrowRequest.itemId);
    if (item) {
      await item.update({ status: 'borrowed' });
    }

    // Notify user that their request was approved
    io.to(`user-${borrowRequest.userId}`).emit('borrowRequestApproved', {
      id: borrowRequest.id,
      item: item ? {
        id: item.id,
        name: item.name
      } : null,
      timestamp: new Date()
    });

    res.json(borrowRequest);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to approve borrow request' });
  }
};

export const returnItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const borrowRequest = await BorrowRequest.findByPk(id, {
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ]
    });

    if (!borrowRequest) {
      res.status(404).json({ message: 'Borrow request not found' });
      return;
    }

    await borrowRequest.update({
      status: 'returned',
      returnDate: new Date()
    });

    // Get the associated item and update it
    const item = await Item.findByPk(borrowRequest.itemId);
    if (item) {
      await item.update({ status: 'available' });
    }

    // Get user info
    const user = await User.findByPk(borrowRequest.userId);

    // Notify admins about returned item
    io.to('admins').emit('itemReturned', {
      id: borrowRequest.id,
      item: item ? {
        id: item.id,
        name: item.name,
        category: item.Category ? item.Category.name : null
      } : null,
      user: user ? {
        id: user.id,
        name: user.name
      } : null,
      returnDate: borrowRequest.returnDate,
      timestamp: new Date()
    });

    res.json(borrowRequest);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process return' });
  }
};

export const getBorrowRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await BorrowRequest.findAndCountAll({
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ],
      limit,
      offset,
      order: [['updatedAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      requests: rows,
      pagination: {
        total: count,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch borrow requests' });
  }
}; 