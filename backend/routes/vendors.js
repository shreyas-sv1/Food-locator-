const express = require('express');
const { body } = require('express-validator');
const {
  getVendors,
  getVendorById,
  createVendor,
  getTrendingVendors,
  getUserVendors,
} = require('../controllers/vendorController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', getVendors);
router.get('/trending', getTrendingVendors);
router.get('/mine', auth, getUserVendors);
router.get('/:id', getVendorById);

router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Vendor name is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  createVendor
);

module.exports = router;
