import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role } = req.body;
    
    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }
    
    const user = await User.create({
      name,
      email,
      role: role || 'user'
    });
    
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      message: 'Failed to create user',
      error: error?.message || 'Unknown error'
    });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'user'].includes(role)) {
      res.status(400).json({ message: 'Valid role (admin or user) is required' });
      return;
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    await user.update({ role });
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
}; 