const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

exports.uploadPhoto = async (req, res) => {
  const { vendor_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  if (!vendor_id) {
    return res.status(400).json({ error: 'vendor_id is required' });
  }

  try {
    const vendor = await pool.query('SELECT id FROM vendors WHERE id = $1', [vendor_id]);
    if (vendor.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Upload to Cloudinary from buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'streetbite',
          transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const result = await pool.query(
      `INSERT INTO photos (vendor_id, image_url, uploaded_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [vendor_id, uploadResult.secure_url, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

exports.uploadMenuImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'streetbite/menu',
          transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(201).json({ image_url: uploadResult.secure_url });
  } catch (err) {
    console.error('Menu image upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
