const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');
const { validateUserRegistration, validateStore } = require('../middleware/validation');

const router = express.Router();

// Apply admin middleware to all routes
router.use(auth, requireRole(['admin']));

// Dashboard Statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM stores'),
      pool.query('SELECT COUNT(*) as count FROM ratings')
    ]);

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with filters
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = `
      SELECT id, name, email, address, role, created_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
    }

    if (email) {
      paramCount++;
      query += ` AND email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
    }

    if (address) {
      paramCount++;
      query += ` AND address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
    }

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    // Validate sort fields
    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const userResult = await pool.query(`
      SELECT id, name, email, address, role, created_at 
      FROM users 
      WHERE id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // If user is a store owner, get their store rating
    if (user.role === 'store_owner') {
      const ratingResult = await pool.query(`
        SELECT AVG(r.rating) as average_rating, COUNT(r.id) as total_ratings
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.owner_id = $1
        GROUP BY s.owner_id
      `, [id]);

      if (ratingResult.rows.length > 0) {
        user.averageRating = parseFloat(ratingResult.rows[0].average_rating) || 0;
        user.totalRatings = parseInt(ratingResult.rows[0].total_ratings) || 0;
      } else {
        user.averageRating = 0;
        user.totalRatings = 0;
      }
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new user
router.post('/users', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, address',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all stores with filters
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name as owner_name, u.email as owner_email,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
    }

    if (email) {
      paramCount++;
      query += ` AND s.email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
    }

    if (address) {
      paramCount++;
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name, u.email`;

    // Validate sort fields
    const allowedSortFields = ['name', 'email', 'address', 'average_rating', 'total_ratings', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(query, params);
    
    const stores = result.rows.map(row => ({
      ...row,
      average_rating: parseFloat(row.average_rating),
      total_ratings: parseInt(row.total_ratings)
    }));

    res.json({ stores });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new store
router.post('/stores', validateStore, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store already exists
    const existingStore = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existingStore.rows.length > 0) {
      return res.status(400).json({ message: 'Store with this email already exists' });
    }

    // Verify owner exists and is a store owner
    if (ownerId) {
      const ownerResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [ownerId]);
      if (ownerResult.rows.length === 0) {
        return res.status(400).json({ message: 'Owner not found' });
      }
      if (ownerResult.rows[0].role !== 'store_owner') {
        return res.status(400).json({ message: 'Owner must be a store owner' });
      }
    }

    // Create store
    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id',
      [name, email, address, ownerId || null]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: result.rows[0]
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 