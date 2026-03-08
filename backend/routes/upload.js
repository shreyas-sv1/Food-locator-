const express = require('express');
const { uploadPhoto, uploadMenuImage } = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', auth, upload.single('image'), uploadPhoto);
router.post('/menu-image', auth, upload.single('image'), uploadMenuImage);

module.exports = router;
