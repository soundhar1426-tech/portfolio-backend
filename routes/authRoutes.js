const express = require('express');
const router = express.Router();
const { verifyPassword } = require('../controllers/authController');

router.post('/verify', verifyPassword);

module.exports = router;
