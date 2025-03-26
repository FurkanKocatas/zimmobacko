import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Item } from '../models';
import sequelize from '../config/database';
import { io } from '../app';

export const startMaintenance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const item = await Item.findByPk(id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    // Can only put available items into maintenance
    if (item.status !== 'available') {
      res.status(400).json({ message: 'Item is not available for maintenance' });
      return;
    }
    
    // Update item status
    await item.update({ 
      status: 'maintenance'
    });
    
    // Log maintenance history (we could create a separate model for this)
    await sequelize.query(
      `INSERT INTO maintenance_logs (item_id, reason, start_date) VALUES (:itemId, :reason, NOW())`,
      {
        replacements: { itemId: id, reason: reason || 'Routine maintenance' }
      }
    );
    
    // Notify admins
    io.to('admins').emit('itemMaintenance', {
      id: item.id,
      name: item.name,
      reason: reason || 'Routine maintenance',
      timestamp: new Date()
    });
    
    res.json(item);
  } catch (error: any) {
    console.error('Maintenance error:', error);
    res.status(500).json({ 
      message: 'Failed to start maintenance',
      error: error?.message || 'Unknown error'
    });
  }
};

export const completeMaintenance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const item = await Item.findByPk(id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    // Can only complete maintenance for items in maintenance
    if (item.status !== 'maintenance') {
      res.status(400).json({ message: 'Item is not in maintenance' });
      return;
    }
    
    // Update item status
    await item.update({ 
      status: 'available'
    });
    
    // Update maintenance log
    await sequelize.query(
      `UPDATE maintenance_logs SET end_date = NOW(), notes = :notes WHERE item_id = :itemId AND end_date IS NULL`,
      {
        replacements: { itemId: id, notes: notes || '' }
      }
    );
    
    // Notify admins
    io.to('admins').emit('maintenanceCompleted', {
      id: item.id,
      name: item.name,
      notes: notes || 'Maintenance completed',
      timestamp: new Date()
    });
    
    res.json(item);
  } catch (error: any) {
    console.error('Maintenance completion error:', error);
    res.status(500).json({ 
      message: 'Failed to complete maintenance',
      error: error?.message || 'Unknown error'
    });
  }
}; 