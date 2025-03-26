import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

class Item extends Model {
  public id!: number;
  public name!: string;
  public serialNumber!: string;
  public qrCode!: string;
  public status!: 'available' | 'borrowed' | 'maintenance' | 'pending';
  public categoryId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Add this declaration for association
  public readonly Category?: Category;
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    qrCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'borrowed', 'maintenance', 'pending'),
      defaultValue: 'available',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'items',
  }
);

export default Item; 