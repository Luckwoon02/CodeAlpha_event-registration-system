// Resume Routes - Handles all resume-related API endpoints
// This file contains the route handlers for resume operations

const express = require('express');
const Resume = require('../models/Resume');
const Candidate = require('../models/Candidate');

// Create a router instance
const router = express.Router();

// POST /resumes - Create a new resume record
// This endpoint allows candidates to upload resume information
router.post('/', async (req, res) => {
  try {
    console.log('📄 Received request to create new resume');
    console.log('Request body:', req.body);
    
    // Extract data from request body
    const { candidateId, fileUrl } = req.body;
    
    // Input validation - check if required fields are provided
    if (!candidateId) {
      return res.status(400).json({
        error: true,
        message: 'Candidate ID is required',
        field: 'candidateId'
      });
    }
    
    if (!fileUrl) {
      return res.status(400).json({
        error: true,
        message: 'Resume file URL is required',
        field: 'fileUrl'
      });
    }
    
    // Validate that the candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        error: true,
        message: 'Candidate not found',
        field: 'candidateId'
      });
    }
    
    // Create new resume instance
    const newResume = new Resume({
      candidateId: candidateId,
      fileUrl: fileUrl.trim()
    });
    
    // Save to database
    const savedResume = await newResume.save();
    
    // Populate candidate information for the response
    await savedResume.populate('candidateId', 'name email');
    
    console.log('✅ Resume created successfully:', savedResume.getDisplayInfo());
    
    // Send success response with created resume data
    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: {
        id: savedResume._id,
        fileUrl: savedResume.fileUrl,
        fileExtension: savedResume.getFileExtension(),
        candidate: {
          id: savedResume.candidateId._id,
          name: savedResume.candidateId.name,
          email: savedResume.candidateId.email
        },
        createdAt: savedResume.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating resume:', error.message);
    
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
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid candidate ID format',
        field: 'candidateId'
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: true,
      message: 'Failed to create resume',
      details: error.message
    });
  }
});
// GET /resumes - Get all resumes (for testing/admin purposes)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Received request to get all resumes');
    
    // Get all resumes from database with candidate information
    const resumes = await Resume.find()
      .populate('candidateId', 'name email')  // Include candidate details
      .sort({ createdAt: -1 });  // Sort by newest first
    
    console.log(`✅ Found ${resumes.length} resumes`);
    
    // Format the response data
    const formattedResumes = resumes.map(resume => ({
      id: resume._id,
      fileUrl: resume.fileUrl,
      fileExtension: resume.getFileExtension(),
      candidate: {
        id: resume.candidateId._id,
        name: resume.candidateId.name,
        email: resume.candidateId.email
      },
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${resumes.length} resumes`,
      count: resumes.length,
      data: formattedResumes
    });
    
  } catch (error) {
    console.error('❌ Error fetching resumes:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch resumes',
      details: error.message
    });
  }
});

// GET /resumes/candidate/:candidateId - Get all resumes for a specific candidate
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    console.log(`🔍 Received request to get resumes for candidate: ${candidateId}`);
    
    // Find resumes by candidate ID
    const resumes = await Resume.findByCandidate(candidateId);
    
    console.log(`✅ Found ${resumes.length} resumes for candidate`);
    
    // Format the response data
    const formattedResumes = resumes.map(resume => ({
      id: resume._id,
      fileUrl: resume.fileUrl,
      fileExtension: resume.getFileExtension(),
      candidate: {
        id: resume.candidateId._id,
        name: resume.candidateId.name,
        email: resume.candidateId.email
      },
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${resumes.length} resumes for candidate`,
      candidateId: candidateId,
      count: resumes.length,
      data: formattedResumes
    });
    
  } catch (error) {
    console.error('❌ Error fetching candidate resumes:', error.message);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid candidate ID format',
        candidateId: req.params.candidateId
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch candidate resumes',
      details: error.message
    });
  }
});

// GET /resumes/:id - Get a specific resume by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Received request to get resume with ID: ${id}`);
    
    // Find resume by ID with candidate information
    const resume = await Resume.findById(id).populate('candidateId', 'name email');
    
    if (!resume) {
      return res.status(404).json({
        error: true,
        message: 'Resume not found',
        id: id
      });
    }
    
    console.log('✅ Resume found:', resume.getDisplayInfo());
    
    res.status(200).json({
      success: true,
      message: 'Resume found',
      data: {
        id: resume._id,
        fileUrl: resume.fileUrl,
        fileExtension: resume.getFileExtension(),
        candidate: {
          id: resume.candidateId._id,
          name: resume.candidateId.name,
          email: resume.candidateId.email
        },
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching resume:', error.message);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid resume ID format',
        id: req.params.id
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch resume',
      details: error.message
    });
  }
});

// Export the router so it can be used in server.js
module.exports = router;

/*
USAGE EXAMPLES:

1. Create a resume:
   POST /resumes
   {
     "candidateId": "60f7b3b3b3b3b3b3b3b3b3b3",
     "fileUrl": "https://example.com/resume.pdf"
   }

2. Get all resumes:
   GET /resumes

3. Get resumes for a specific candidate:
   GET /resumes/candidate/60f7b3b3b3b3b3b3b3b3b3b3

4. Get specific resume:
   GET /resumes/60f7b3b3b3b3b3b3b3b3b3b3

RESPONSE FORMATS:

Success Response:
{
  "success": true,
  "message": "Resume created successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fileUrl": "https://example.com/resume.pdf",
    "fileExtension": "pdf",
    "candidate": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2023-07-21T10:30:00.000Z"
  }
}
*/