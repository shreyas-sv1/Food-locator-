const express = require('express');
const { body } = require('express-validator');
const { addMenuItem, getMenuByVendor, deleteMenuItem } = require('../controllers/menuController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:vendorId', getMenuByVendor);

router.post(
  '/',
  auth,
  [
    body('vendor_id').isUUID().withMessage('Valid vendor ID is required'),
    body('item_name').trim().notEmpty().withMessage('Item name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  ],
  addMenuItem
);

router.delete('/:id', auth, deleteMenuItem);

module.exports = router;
