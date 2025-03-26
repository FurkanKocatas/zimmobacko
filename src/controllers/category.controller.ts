import { Response } from 'express';
import { Category } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    console.log('Attempting to create category with:', { name, description });
    
    // Validate required fields
    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      res.status(409).json({ message: `Category "${name}" already exists` });
      return;
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json(category);
  } catch (error: any) {
    console.error('Create category error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      error
    });

    // Handle specific error cases
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ 
        message: `Category "${req.body.name}" already exists`
      });
      return;
    }

    res.status(500).json({ 
      message: 'Failed to create category',
      error: error?.message || 'Unknown error'
    });
  }
};

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch categories',
      error: error?.message || 'Unknown error'
    });
  }
}; 