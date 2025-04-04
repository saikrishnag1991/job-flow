const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserById, updateUserById } = require('../controllers/userController');
const router = express.Router();

// Register User
router.post('/register', registerUser);

// Login User
router.post('/login', loginUser);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user by ID
router.put('/:id', updateUserById);

module.exports = router;
