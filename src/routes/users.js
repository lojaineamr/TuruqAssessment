const express = require('express');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
  paginationValidation
} = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticate);


// get user statistics
// GET /api/users/stats
router.get('/stats', asyncHandler(getUserStats));


// create a new user
// POST /api/users
router.post('/', createUserValidation, asyncHandler(createUser));


// get all users with pagination and filtering
// GET /api/users
router.get('/', paginationValidation, asyncHandler(getUsers));


// get user by ID
// GET /api/users/:id
router.get('/:id', userIdValidation, asyncHandler(getUserById));


// update user
// PUT /api/users/:id
router.put('/:id', [...userIdValidation, ...updateUserValidation], asyncHandler(updateUser));

// delete user
// DELETE /api/users/:id
router.delete('/:id', userIdValidation, asyncHandler(deleteUser));

module.exports = router;