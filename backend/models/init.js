const pool = require('../config/db');

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        address TEXT,
        category TEXT NOT NULL,
        is_veg BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        rating DOUBLE PRECISION DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        image_url TEXT,
        is_veg BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(vendor_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
      CREATE INDEX IF NOT EXISTS idx_menu_vendor ON menu_items(vendor_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON reviews(vendor_id);
      CREATE INDEX IF NOT EXISTS idx_photos_vendor ON photos(vendor_id);
    `);
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initializeDatabase };
