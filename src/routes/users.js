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
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticate);


// get user statistics (admin only)
// GET /api/users/stats
router.get('/stats', authorize('admin'), asyncHandler(getUserStats));


// create a new user (admin only)
// POST /api/users
router.post('/', authorize('admin'), createUserValidation, asyncHandler(createUser));


// get all users with pagination and filtering (admin only)
// GET /api/users
router.get('/', authorize('admin'), paginationValidation, asyncHandler(getUsers));


// get user by ID
// GET /api/users/:id
router.get('/:id', userIdValidation, asyncHandler(getUserById));


// update user (admin only)
// PUT /api/users/:id
router.put('/:id', authorize('admin'), [...userIdValidation, ...updateUserValidation], asyncHandler(updateUser));

// delete user (admin only)
// DELETE /api/users/:id
router.delete('/:id', authorize('admin'), userIdValidation, asyncHandler(deleteUser));

module.exports = router;