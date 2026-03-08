const pool = require('../config/db');
const { validationResult } = require('express-validator');

exports.getVendors = async (req, res) => {
  const { lat, lng, radius = 10, category, is_veg, min_price, max_price, search, sort = 'distance' } = req.query;

  try {
    let query = '';
    const params = [];
    let paramIndex = 1;

    if (lat && lng) {
      // Haversine formula for distance in km
      query = `
        SELECT v.*,
          (6371 * acos(
            cos(radians($${paramIndex})) * cos(radians(v.latitude)) *
            cos(radians(v.longitude) - radians($${paramIndex + 1})) +
            sin(radians($${paramIndex})) * sin(radians(v.latitude))
          )) AS distance
        FROM vendors v
      `;
      params.push(parseFloat(lat), parseFloat(lng));
      paramIndex += 2;
    } else {
      query = `SELECT v.*, 0 AS distance FROM vendors v`;
    }

    const conditions = [];

    if (category) {
      conditions.push(`v.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (is_veg === 'true') {
      conditions.push(`v.is_veg = true`);
    }

    if (search) {
      conditions.push(`(
        LOWER(v.name) LIKE $${paramIndex} OR
        LOWER(v.description) LIKE $${paramIndex} OR
        EXISTS (
          SELECT 1 FROM menu_items mi WHERE mi.vendor_id = v.id
          AND LOWER(mi.item_name) LIKE $${paramIndex}
        )
      )`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (lat && lng && radius) {
      const havingClause = `distance <= $${paramIndex}`;
      params.push(parseFloat(radius));
      paramIndex++;

      if (sort === 'rating') {
        query += ` ORDER BY v.rating DESC, distance ASC`;
      } else {
        // Default sort by distance
        query = `SELECT * FROM (${query}) AS sub WHERE ${havingClause} ORDER BY distance ASC`;
      }
    } else {
      if (sort === 'rating') {
        query += ' ORDER BY v.rating DESC';
      } else {
        query += ' ORDER BY v.created_at DESC';
      }
    }

    query += ` LIMIT 100`;

    const result = await pool.query(query, params);

    // If price filter, post-filter based on menu items
    let vendors = result.rows;

    if (min_price || max_price) {
      const vendorIds = vendors.map((v) => v.id);
      if (vendorIds.length > 0) {
        const menuResult = await pool.query(
          `SELECT DISTINCT vendor_id FROM menu_items
           WHERE vendor_id = ANY($1)
           AND price >= $2 AND price <= $3`,
          [vendorIds, parseFloat(min_price || 0), parseFloat(max_price || 10000)]
        );
        const matchingIds = new Set(menuResult.rows.map((r) => r.vendor_id));
        vendors = vendors.filter((v) => matchingIds.has(v.id));
      }
    }

    res.json(vendors);
  } catch (err) {
    console.error('Get vendors error:', err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

exports.getVendorById = async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.query;

  try {
    let query;
    let params;

    if (lat && lng) {
      query = `
        SELECT v.*,
          (6371 * acos(
            cos(radians($2)) * cos(radians(v.latitude)) *
            cos(radians(v.longitude) - radians($3)) +
            sin(radians($2)) * sin(radians(v.latitude))
          )) AS distance
        FROM vendors v WHERE v.id = $1
      `;
      params = [id, parseFloat(lat), parseFloat(lng)];
    } else {
      query = 'SELECT *, 0 AS distance FROM vendors WHERE id = $1';
      params = [id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = result.rows[0];

    // Fetch menu, reviews, photos in parallel
    const [menuRes, reviewRes, photoRes] = await Promise.all([
      pool.query('SELECT * FROM menu_items WHERE vendor_id = $1 ORDER BY item_name', [id]),
      pool.query(
        `SELECT r.*, u.name AS user_name FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.vendor_id = $1 ORDER BY r.created_at DESC`,
        [id]
      ),
      pool.query('SELECT * FROM photos WHERE vendor_id = $1 ORDER BY created_at DESC', [id]),
    ]);

    vendor.menu = menuRes.rows;
    vendor.reviews = reviewRes.rows;
    vendor.photos = photoRes.rows;

    res.json(vendor);
  } catch (err) {
    console.error('Get vendor error:', err);
    res.status(500).json({ error: 'Failed to fetch vendor details' });
  }
};

exports.createVendor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, latitude, longitude, address, category, is_veg } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO vendors (name, description, latitude, longitude, address, category, is_veg, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, parseFloat(latitude), parseFloat(longitude), address, category, is_veg || false, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create vendor error:', err);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
};

exports.getTrendingVendors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vendors
       WHERE review_count > 0
       ORDER BY rating DESC, review_count DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Trending vendors error:', err);
    res.status(500).json({ error: 'Failed to fetch trending vendors' });
  }
};

exports.getUserVendors = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vendors WHERE created_by = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('User vendors error:', err);
    res.status(500).json({ error: 'Failed to fetch user vendors' });
  }
};
