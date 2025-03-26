import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BorrowRequest, Item, User, Category } from '../models';
import { Parser } from 'json2csv';

export const exportItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Item.findAll({
      include: [Category]
    });
    
    const fields = [
      'id',
      'name',
      'serialNumber',
      'qrCode',
      'status',
      { label: 'Category', value: 'Category.name' },
      'createdAt',
      'updatedAt'
    ];
    
    // Convert Sequelize models to plain objects
    const itemsData = items.map(item => {
      const plainItem = item.get({ plain: true });
      return {
        ...plainItem,
        'Category.name': plainItem.Category?.name
      };
    });
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(itemsData);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('items-export.csv');
    res.send(csv);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ 
      message: 'Failed to export items',
      error: error?.message || 'Unknown error'
    });
  }
};

export const exportBorrowHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const borrowRequests = await BorrowRequest.findAll({
      include: [
        { model: Item, include: [Category] },
        { model: User }
      ]
    });
    
    const fields = [
      'id',
      { label: 'User', value: 'User.name' },
      { label: 'Item', value: 'Item.name' },
      { label: 'Category', value: 'Item.Category.name' },
      'status',
      'borrowDate',
      'returnDate',
      'createdAt'
    ];
    
    // Convert Sequelize models to plain objects
    const requestsData = borrowRequests.map(req => {
      const plainReq = req.get({ plain: true });
      return {
        ...plainReq,
        'User.name': plainReq.User?.name,
        'Item.name': plainReq.Item?.name,
        'Item.Category.name': plainReq.Item?.Category?.name
      };
    });
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(requestsData);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('borrow-history-export.csv');
    res.send(csv);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ 
      message: 'Failed to export borrow history',
      error: error?.message || 'Unknown error'
    });
  }
}; 