const express = require('express');
const { body } = require('express-validator');
const { addReview, getReviewsByVendor, getUserReviews } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/mine', auth, getUserReviews);
router.get('/:vendorId', getReviewsByVendor);

router.post(
  '/',
  auth,
  [
    body('vendor_id').isUUID().withMessage('Valid vendor ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  addReview
);

module.exports = router;
