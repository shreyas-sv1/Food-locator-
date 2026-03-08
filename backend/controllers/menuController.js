const pool = require('../config/db');
const { validationResult } = require('express-validator');

exports.addMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { vendor_id, item_name, price, image_url, is_veg } = req.body;

  try {
    // Verify vendor exists and user owns it
    const vendor = await pool.query('SELECT created_by FROM vendors WHERE id = $1', [vendor_id]);
    if (vendor.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    if (vendor.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only add menu items to your own vendors' });
    }

    const result = await pool.query(
      `INSERT INTO menu_items (vendor_id, item_name, price, image_url, is_veg)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [vendor_id, item_name, parseFloat(price), image_url || null, is_veg || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add menu item error:', err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

exports.getMenuByVendor = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE vendor_id = $1 ORDER BY item_name',
      [vendorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get menu error:', err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await pool.query(
      `SELECT mi.*, v.created_by FROM menu_items mi
       JOIN vendors v ON mi.vendor_id = v.id
       WHERE mi.id = $1`,
      [id]
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    if (item.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};
