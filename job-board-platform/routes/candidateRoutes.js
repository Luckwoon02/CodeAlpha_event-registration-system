// Candidate Routes - Handles all candidate-related API endpoints
// This file contains the route handlers for candidate operations

const express = require('express');
const Candidate = require('../models/Candidate');

// Create a router instance
const router = express.Router();

// POST /candidates - Create a new candidate
// This endpoint allows job seekers to register on the platform
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received request to create new candidate');
    console.log('Request body:', req.body);
    
    // Extract data from request body
    const { name, email } = req.body;
    
    // Input validation - check if required fields are provided
    if (!name) {
      return res.status(400).json({
        error: true,
        message: 'Candidate name is required',
        field: 'name'
      });
    }
    
    if (!email) {
      return res.status(400).json({
        error: true,
        message: 'Email is required',
        field: 'email'
      });
    }
    
    // Check if candidate with this email already exists
    const existingCandidate = await Candidate.findByEmail(email);
    if (existingCandidate) {
      return res.status(409).json({
        error: true,
        message: 'A candidate with this email already exists',
        field: 'email'
      });
    }
    
    // Create new candidate instance
    const newCandidate = new Candidate({
      name: name.trim(),
      email: email.trim().toLowerCase()
    });
    
    // Save to database
    const savedCandidate = await newCandidate.save();
    
    console.log('✅ Candidate created successfully:', savedCandidate.getDisplayName());
    
    // Send success response with created candidate data
    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: {
        id: savedCandidate._id,
        name: savedCandidate.name,
        email: savedCandidate.email,
        createdAt: savedCandidate.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating candidate:', error.message);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: validationErrors
      });
    }
    
    if (error.code === 11000) {
      // Duplicate key error (unique constraint violation)
      return res.status(409).json({
        error: true,
        message: 'A candidate with this email already exists',
        field: 'email'
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: true,
      message: 'Failed to create candidate',
      details: error.message
    });
  }
});
// GET /candidates - Get all candidates (for testing/admin purposes)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Received request to get all candidates');
    
    // Get all candidates from database
    const candidates = await Candidate.find()
      .select('name email createdAt') // Only return specific fields
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`✅ Found ${candidates.length} candidates`);
    
    res.status(200).json({
      success: true,
      message: `Found ${candidates.length} candidates`,
      count: candidates.length,
      data: candidates
    });
    
  } catch (error) {
    console.error('❌ Error fetching candidates:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch candidates',
      details: error.message
    });
  }
});

// GET /candidates/:id - Get a specific candidate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Received request to get candidate with ID: ${id}`);
    
    // Find candidate by ID
    const candidate = await Candidate.findById(id);
    
    if (!candidate) {
      return res.status(404).json({
        error: true,
        message: 'Candidate not found',
        id: id
      });
    }
    
    console.log('✅ Candidate found:', candidate.getDisplayName());
    
    res.status(200).json({
      success: true,
      message: 'Candidate found',
      data: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching candidate:', error.message);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid candidate ID format',
        id: req.params.id
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch candidate',
      details: error.message
    });
  }
});

// Export the router so it can be used in server.js
module.exports = router;

/*
USAGE EXAMPLES:

1. Create a candidate:
   POST /candidates
   {
     "name": "John Doe",
     "email": "john@example.com"
   }

2. Get all candidates:
   GET /candidates

3. Get specific candidate:
   GET /candidates/60f7b3b3b3b3b3b3b3b3b3b3

RESPONSE FORMATS:

Success Response:
{
  "success": true,
  "message": "Candidate created successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-07-21T10:30:00.000Z"
  }
}

Error Response:
{
  "error": true,
  "message": "Candidate name is required",
  "field": "name"
}
*/