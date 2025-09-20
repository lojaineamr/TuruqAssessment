const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// register a new admin
// POST /api/auth/register
router.post('/register', registerValidation, asyncHandler(register));

// login admin
// POST /api/auth/login
router.post('/login', loginValidation, asyncHandler(login));


// get current admin 
// GET /api/auth/profile
router.get('/profile', authenticate, asyncHandler(getProfile));

module.exports = router;