const express = require('express');
const { register, login, refresh, logout, logoutAll } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// POST /api/auth/logout
router.post('/logout', auth, logout);

// POST /api/auth/logout-all
router.post('/logout-all', auth, logoutAll);

module.exports = router; 