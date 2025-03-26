import { Request, Response } from 'express';
import { User } from '../models';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    console.log('Login attempt for email:', email);
    
    const user = await User.findOne({ where: { email } });
    
    console.log('Found user:', user);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const token = generateToken(user);
    console.log('Generated token:', token);
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 