import User from './User';
import Category from './Category';
import Item from './Item';
import BorrowRequest from './BorrowRequest';
import AuditLog from './AuditLog';

// Associations
Category.hasMany(Item, { foreignKey: 'categoryId' });
Item.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(BorrowRequest, { foreignKey: 'userId' });
BorrowRequest.belongsTo(User, { foreignKey: 'userId' });

Item.hasMany(BorrowRequest, { foreignKey: 'itemId' });
BorrowRequest.belongsTo(Item, { foreignKey: 'itemId' });

export { User, Category, Item, BorrowRequest, AuditLog }; 