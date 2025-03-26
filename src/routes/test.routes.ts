import { Router } from 'express';
import { User, Category, Item, BorrowRequest } from '../models';

const router = Router();

// Test database connection
router.get('/health', async (req, res) => {
  try {
    await User.findAll({ limit: 1 });
    res.json({ status: 'Database connection is healthy' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Test create category
router.post('/category', async (req, res) => {
  try {
    const category = await Category.create({
      name: req.body.name,
      description: req.body.description
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Test create item
router.post('/item', async (req, res) => {
  try {
    const item = await Item.create({
      name: req.body.name,
      serialNumber: req.body.serialNumber,
      qrCode: req.body.qrCode,
      categoryId: req.body.categoryId
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Get all items with their categories
router.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [Category]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Add this to your existing test.routes.ts
router.post('/create-test-user', async (req, res) => {
  try {
    const user = await User.create({
      email: "test@example.com",
      name: "Test User",
      role: "admin"
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

// Add this to your existing test routes
router.get('/check-user', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router; 