import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Item from './Item';

class BorrowRequest extends Model {
  public id!: number;
  public userId!: number;
  public itemId!: number;
  public status!: 'pending' | 'approved' | 'rejected' | 'returned';
  public borrowDate!: Date;
  public returnDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Add these declarations for associations
  public readonly Item?: Item;
  public readonly User?: User;
}

BorrowRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Item,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'returned'),
      defaultValue: 'pending',
    },
    borrowDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'borrow_requests',
  }
);

export default BorrowRequest; 