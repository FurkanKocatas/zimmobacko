import { Response } from 'express';
import { Item, Category } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { Op } from 'sequelize';
import { generateQRCode } from '../utils/qrcode';
import { logAuditEvent } from '../utils/audit';

export const createItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, serialNumber, qrCode, categoryId } = req.body;
    
    // Validate required fields
    if (!name || !serialNumber || !qrCode || !categoryId) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const item = await Item.create({
      name,
      serialNumber,
      qrCode,
      categoryId,
      status: 'available'
    });

    // Log audit event
    await logAuditEvent(
      req.user.id,
      'CREATE',
      'Item',
      item.id,
      `Created item: ${name}`
    );

    res.status(201).json(item);
  } catch (error: any) {
    console.error('Create item error:', error);
    res.status(500).json({ 
      message: 'Failed to create item',
      error: error?.message 
    });
  }
};

export const getItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Item.findAndCountAll({
      include: [Category],
      limit,
      offset,
      order: [['updatedAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      items: rows,
      pagination: {
        total: count,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

export const updateItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item' });
  }
};

export const updateItemStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = await Item.findByPk(id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    await item.update({ status });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update item status' });
  }
};

export const getAvailableItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Item.findAll({
      where: { status: 'available' },
      include: [Category]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch available items' });
  }
};

export const searchItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query, category, status, sortBy, order } = req.query;
    
    // Build the where clause
    const where: any = {};
    
    if (query) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { serialNumber: { [Op.iLike]: `%${query}%` } },
        { qrCode: { [Op.iLike]: `%${query}%` } }
      ];
    }
    
    if (category) {
      where.categoryId = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Build the order clause
    const orderClause: any = [];
    if (sortBy) {
      orderClause.push([sortBy as string, (order === 'desc' ? 'DESC' : 'ASC')]);
    } else {
      orderClause.push(['updatedAt', 'DESC']);
    }
    
    const items = await Item.findAll({
      where,
      include: [Category],
      order: orderClause
    });
    
    res.json(items);
  } catch (error: any) {
    console.error('Search items error:', error);
    res.status(500).json({ 
      message: 'Failed to search items',
      error: error?.message 
    });
  }
};

export const getItemQRCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Generate QR code with item data
    const itemData = JSON.stringify({
      id: item.id,
      serialNumber: item.serialNumber,
      name: item.name
    });
    
    const qrCode = await generateQRCode(itemData);
    
    res.json({ qrCode });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
};

export const getItemById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const item = await Item.findByPk(id, {
      include: [Category]
    });
    
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch item' });
  }
};

export const createBulkItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Items array is required' });
      return;
    }

    // Validate all items before creating any
    for (const item of items) {
      const { name, serialNumber, qrCode, categoryId } = item;
      if (!name || !serialNumber || !qrCode || !categoryId) {
        res.status(400).json({ 
          message: 'All fields are required for each item',
          invalidItem: item
        });
        return;
      }
      
      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        res.status(404).json({ 
          message: `Category with ID ${categoryId} not found`,
          invalidItem: item
        });
        return;
      }
    }

    // Create all items
    const createdItems = await Promise.all(
      items.map(item => Item.create({
        ...item,
        status: 'available'
      }))
    );

    res.status(201).json(createdItems);
  } catch (error: any) {
    console.error('Bulk create items error:', error);
    res.status(500).json({ 
      message: 'Failed to create items',
      error: error?.message 
    });
  }
}; 