const pool = require('../config/db');
const { validationResult } = require('express-validator');

exports.addReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { vendor_id, rating, comment } = req.body;

  try {
    const vendor = await pool.query('SELECT id FROM vendors WHERE id = $1', [vendor_id]);
    if (vendor.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Upsert review (one review per user per vendor)
    const result = await pool.query(
      `INSERT INTO reviews (vendor_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (vendor_id, user_id)
       DO UPDATE SET rating = $3, comment = $4, created_at = NOW()
       RETURNING *`,
      [vendor_id, req.user.id, parseInt(rating), comment]
    );

    // Recalculate vendor rating
    const stats = await pool.query(
      `SELECT AVG(rating)::NUMERIC(3,2) AS avg_rating, COUNT(*) AS count
       FROM reviews WHERE vendor_id = $1`,
      [vendor_id]
    );

    await pool.query(
      'UPDATE vendors SET rating = $1, review_count = $2 WHERE id = $3',
      [parseFloat(stats.rows[0].avg_rating), parseInt(stats.rows[0].count), vendor_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

exports.getReviewsByVendor = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC`,
      [vendorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, v.name AS vendor_name FROM reviews r
       JOIN vendors v ON r.vendor_id = v.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('User reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
};
