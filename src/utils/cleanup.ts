import { BorrowRequest } from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';

export const archiveOldBorrowRequests = async (): Promise<void> => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Find old completed requests
    const oldRequests = await BorrowRequest.findAll({
      where: {
        status: 'returned',
        updatedAt: {
          [Op.lt]: oneYearAgo
        }
      }
    });
    
    if (oldRequests.length === 0) {
      console.log('No old borrow requests to archive');
      return;
    }
    
    // Convert to CSV and save to archive
    const fields = ['id', 'userId', 'itemId', 'status', 'borrowDate', 'returnDate', 'createdAt', 'updatedAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(oldRequests.map(req => req.get({ plain: true })));
    
    // Ensure archive directory exists
    const archiveDir = path.join(__dirname, '../../archives');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    
    // Write to archive file
    const filename = `borrow-archive-${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(path.join(archiveDir, filename), csv);
    
    // Delete from database
    const count = await BorrowRequest.destroy({
      where: {
        id: {
          [Op.in]: oldRequests.map(req => req.id)
        }
      }
    });
    
    console.log(`Archived and deleted ${count} old borrow requests to ${filename}`);
  } catch (error) {
    console.error('Failed to archive old borrow requests:', error);
  }
}; 