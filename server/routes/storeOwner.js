const express = require('express');
const pool = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply store owner middleware to all routes
router.use(auth, requireRole(['store_owner']));

// Get store owner dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store information
    const storeResult = await pool.query(`
      SELECT s.id, s.name, s.email, s.address,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address
    `, [userId]);

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const store = storeResult.rows[0];

    // Get users who rated the store
    const ratingsResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.address, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `, [store.id]);

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: parseFloat(store.average_rating),
        totalRatings: parseInt(store.total_ratings)
      },
      ratings: ratingsResult.rows.map(row => ({
        userId: row.id,
        userName: row.name,
        userEmail: row.email,
        userAddress: row.address,
        rating: row.rating,
        ratedAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        s.id,
        s.name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const stats = result.rows[0];
    res.json({
      storeId: stats.id,
      storeName: stats.name,
      averageRating: parseFloat(stats.average_rating),
      totalRatings: parseInt(stats.total_ratings),
      ratingDistribution: {
        fiveStar: parseInt(stats.five_star),
        fourStar: parseInt(stats.four_star),
        threeStar: parseInt(stats.three_star),
        twoStar: parseInt(stats.two_star),
        oneStar: parseInt(stats.one_star)
      }
    });
  } catch (error) {
    console.error('Store stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 