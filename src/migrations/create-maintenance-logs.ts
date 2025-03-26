import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

export const migrateMaintenanceLogs = async (): Promise<void> => {
  try {
    // Check if table exists
    const tables = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'maintenance_logs'
      )`,
      { type: QueryTypes.SELECT }
    );
    
    const tableExists = Object.values(tables[0])[0];
    
    if (!tableExists) {
      // Create table
      await sequelize.query(`
        CREATE TABLE maintenance_logs (
          id SERIAL PRIMARY KEY,
          item_id INTEGER NOT NULL REFERENCES items(id),
          reason TEXT NOT NULL,
          notes TEXT,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Created maintenance_logs table');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}; 