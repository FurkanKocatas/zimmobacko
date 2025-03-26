import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BorrowRequest, Item, User, Category } from '../models';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

// Get weekly report with most borrowed items
export const getWeeklyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get borrow statistics from the last week
    const borrowStats = await BorrowRequest.findAll({
      where: {
        createdAt: {
          [Op.gte]: oneWeekAgo
        }
      },
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ]
    });

    // Most borrowed items - simpler query that works with PostgreSQL
    const itemBorrowCounts = await BorrowRequest.findAll({
      attributes: [
        'itemId',
        [sequelize.fn('COUNT', sequelize.col('itemId')), 'borrowCount']
      ],
      where: {
        createdAt: {
          [Op.gte]: oneWeekAgo
        }
      },
      group: ['itemId'],
      order: [[sequelize.fn('COUNT', sequelize.col('itemId')), 'DESC']],
      limit: 5
    });

    // Get item details separately
    const itemIds = itemBorrowCounts.map(count => count.get('itemId'));
    const items = await Item.findAll({
      where: { id: itemIds },
      include: [Category]
    });

    // Combine the counts with item details
    const mostBorrowedItems = itemBorrowCounts.map(count => {
      const itemId = count.get('itemId');
      const item = items.find(i => i.id === itemId);
      return {
        itemId: itemId,
        borrowCount: count.get('borrowCount'),
        itemName: item?.name,
        categoryName: item?.Category?.name
      };
    });

    // Category usage - simpler approach that works with PostgreSQL
    const categoryQuery = await sequelize.query(`
      SELECT "Item"."categoryId", "Category"."name" as "categoryName", COUNT("BorrowRequest"."id") as "borrowCount"
      FROM "borrow_requests" AS "BorrowRequest"
      JOIN "items" AS "Item" ON "BorrowRequest"."itemId" = "Item"."id"
      JOIN "categories" AS "Category" ON "Item"."categoryId" = "Category"."id"
      WHERE "BorrowRequest"."createdAt" >= :oneWeekAgo
      GROUP BY "Item"."categoryId", "Category"."name"
      ORDER BY COUNT("BorrowRequest"."id") DESC
    `, {
      replacements: { oneWeekAgo: oneWeekAgo },
      type: QueryTypes.SELECT
    });

    res.json({
      totalBorrows: borrowStats.length,
      mostBorrowedItems,
      categoryUsage: categoryQuery
    });
  } catch (error: any) {
    console.error('Weekly report error:', error);
    res.status(500).json({ 
      message: 'Failed to generate weekly report',
      error: error?.message || 'Unknown error'
    });
  }
};

// Get currently borrowed items
export const getCurrentlyBorrowedItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const borrowedItems = await BorrowRequest.findAll({
      where: {
        status: 'approved',
        returnDate: null
      },
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ]
    });

    res.json(borrowedItems);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch currently borrowed items' });
  }
};

// Get late returns (items borrowed for more than 7 days)
export const getLateReturns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lateReturns = await BorrowRequest.findAll({
      where: {
        status: 'approved',
        returnDate: null,
        borrowDate: {
          [Op.lt]: sevenDaysAgo
        }
      },
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ]
    });

    res.json(lateReturns);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch late returns' });
  }
}; 