// Employer Routes - Handles all employer-related API endpoints
// This file contains the route handlers for employer operations

const express = require('express');
const Employer = require('../models/Employer');

// Create a router instance
// Router allows us to group related routes together
const router = express.Router();

// POST /employers - Create a new employer
// This endpoint allows companies to register on the platform
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received request to create new employer');
    console.log('Request body:', req.body);
    
    // Extract data from request body
    const { companyName, email } = req.body;
    
    // Input validation - check if required fields are provided
    if (!companyName) {
      return res.status(400).json({
        error: true,
        message: 'Company name is required',
        field: 'companyName'
      });
    }
    
    if (!email) {
      return res.status(400).json({
        error: true,
        message: 'Email is required',
        field: 'email'
      });
    }
    
    // Check if employer with this email already exists
    const existingEmployer = await Employer.findByEmail(email);
    if (existingEmployer) {
      return res.status(409).json({
        error: true,
        message: 'An employer with this email already exists',
        field: 'email'
      });
    }
    
    // Create new employer instance
    const newEmployer = new Employer({
      companyName: companyName.trim(),
      email: email.trim().toLowerCase()
    });
    
    // Save to database
    const savedEmployer = await newEmployer.save();
    
    console.log('✅ Employer created successfully:', savedEmployer.getDisplayName());
    
    // Send success response with created employer data
    res.status(201).json({
      success: true,
      message: 'Employer created successfully',
      data: {
        id: savedEmployer._id,
        companyName: savedEmployer.companyName,
        email: savedEmployer.email,
        createdAt: savedEmployer.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating employer:', error.message);
    
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
        message: 'An employer with this email already exists',
        field: 'email'
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: true,
      message: 'Failed to create employer',
      details: error.message
    });
  }
});

// GET /employers - Get all employers (for testing/admin purposes)
// This is not in the requirements but useful for debugging
router.get('/', async (req, res) => {
  try {
    console.log('📋 Received request to get all employers');
    
    // Get all employers from database
    const employers = await Employer.find()
      .select('companyName email createdAt') // Only return specific fields
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`✅ Found ${employers.length} employers`);
    
    res.status(200).json({
      success: true,
      message: `Found ${employers.length} employers`,
      count: employers.length,
      data: employers
    });
    
  } catch (error) {
    console.error('❌ Error fetching employers:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch employers',
      details: error.message
    });
  }
});

// GET /employers/:id - Get a specific employer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Received request to get employer with ID: ${id}`);
    
    // Find employer by ID
    const employer = await Employer.findById(id);
    
    if (!employer) {
      return res.status(404).json({
        error: true,
        message: 'Employer not found',
        id: id
      });
    }
    
    console.log('✅ Employer found:', employer.getDisplayName());
    
    res.status(200).json({
      success: true,
      message: 'Employer found',
      data: {
        id: employer._id,
        companyName: employer.companyName,
        email: employer.email,
        createdAt: employer.createdAt,
        updatedAt: employer.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching employer:', error.message);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid employer ID format',
        id: req.params.id
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch employer',
      details: error.message
    });
  }
});

// Export the router so it can be used in server.js
module.exports = router;

/*
USAGE EXAMPLES:

1. Create an employer:
   POST /employers
   {
     "companyName": "Tech Corp",
     "email": "hr@techcorp.com"
   }

2. Get all employers:
   GET /employers

3. Get specific employer:
   GET /employers/60f7b3b3b3b3b3b3b3b3b3b3

RESPONSE FORMATS:

Success Response:
{
  "success": true,
  "message": "Employer created successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "companyName": "Tech Corp",
    "email": "hr@techcorp.com",
    "createdAt": "2023-07-21T10:30:00.000Z"
  }
}

Error Response:
{
  "error": true,
  "message": "Company name is required",
  "field": "companyName"
}
*/