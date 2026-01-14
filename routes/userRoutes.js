// routes/userRoutes.js - This file handles all user-related API endpoints

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /users - Create a new user
// This endpoint allows us to add a new user to the database
router.post('/', async (req, res) => {
  try {
    // Get user data from request body
    const { name, email } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Create a new user object
    const user = new User({
      name,
      email
    });
    
    // Save the user to database
    await user.save();
    
    // Send success response
    res.status(201).json({
      message: 'User created successfully',
      user: user
    });
    
  } catch (error) {
    // If something goes wrong, send error response
    res.status(500).json({ 
      error: 'Error creating user',
      details: error.message 
    });
  }
});

module.exports = router;
