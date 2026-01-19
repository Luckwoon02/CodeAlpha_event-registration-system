// Application Routes - Handles all application-related API endpoints
// This file contains the route handlers for job application operations

const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Resume = require('../models/Resume');

// Create a router instance
const router = express.Router();

// POST /apply - Submit a job application
// This endpoint allows candidates to apply for jobs
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received request to submit job application');
    console.log('Request body:', req.body);
    
    // Extract data from request body
    const { jobId, candidateId, resumeId } = req.body;
    
    // Input validation - check if required fields are provided
    if (!jobId) {
      return res.status(400).json({
        error: true,
        message: 'Job ID is required',
        field: 'jobId'
      });
    }
    
    if (!candidateId) {
      return res.status(400).json({
        error: true,
        message: 'Candidate ID is required',
        field: 'candidateId'
      });
    }
    
    if (!resumeId) {
      return res.status(400).json({
        error: true,
        message: 'Resume ID is required',
        field: 'resumeId'
      });
    }
    
    // Validate that all referenced entities exist
    const [job, candidate, resume] = await Promise.all([
      Job.findById(jobId),
      Candidate.findById(candidateId),
      Resume.findById(resumeId)
    ]);
    
    if (!job) {
      return res.status(404).json({
        error: true,
        message: 'Job not found',
        field: 'jobId'
      });
    }
    
    if (!candidate) {
      return res.status(404).json({
        error: true,
        message: 'Candidate not found',
        field: 'candidateId'
      });
    }
    
    if (!resume) {
      return res.status(404).json({
        error: true,
        message: 'Resume not found',
        field: 'resumeId'
      });
    }
    
    // Validate that the resume belongs to the candidate
    if (resume.candidateId.toString() !== candidateId) {
      return res.status(400).json({
        error: true,
        message: 'Resume does not belong to the specified candidate',
        field: 'resumeId'
      });
    }
    
    // Check if candidate has already applied for this job
    const existingApplication = await Application.findOne({
      jobId: jobId,
      candidateId: candidateId
    });
    
    if (existingApplication) {
      return res.status(409).json({
        error: true,
        message: 'Candidate has already applied for this job',
        existingApplicationId: existingApplication._id
      });
    }
    
    // Create new application instance
    const newApplication = new Application({
      jobId: jobId,
      candidateId: candidateId,
      resumeId: resumeId
      // status defaults to 'applied'
      // appliedAt defaults to current date
    });
    
    // Save to database
    const savedApplication = await newApplication.save();
    
    // Populate all referenced data for the response
    await savedApplication.populate([
      { path: 'jobId', select: 'title location salary' },
      { path: 'candidateId', select: 'name email' },
      { path: 'resumeId', select: 'fileUrl' }
    ]);
    
    console.log('✅ Application submitted successfully:', savedApplication.getDisplayInfo());
    
    // Send success response with created application data
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: savedApplication._id,
        status: savedApplication.status,
        appliedAt: savedApplication.appliedAt,
        daysOld: savedApplication.getDaysOld(),
        job: {
          id: savedApplication.jobId._id,
          title: savedApplication.jobId.title,
          location: savedApplication.jobId.location,
          salary: savedApplication.jobId.salary
        },
        candidate: {
          id: savedApplication.candidateId._id,
          name: savedApplication.candidateId.name,
          email: savedApplication.candidateId.email
        },
        resume: {
          id: savedApplication.resumeId._id,
          fileUrl: savedApplication.resumeId.fileUrl
        },
        createdAt: savedApplication.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting application:', error.message);
    
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
      // Duplicate key error (candidate already applied for this job)
      return res.status(409).json({
        error: true,
        message: 'Candidate has already applied for this job'
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid ID format',
        field: error.path
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: true,
      message: 'Failed to submit application',
      details: error.message
    });
  }
});
// GET /applications/:candidateId - Get all applications for a candidate
// This endpoint allows candidates to view their application history
router.get('/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    console.log(`📋 Received request to get applications for candidate: ${candidateId}`);
    
    // Validate that the candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        error: true,
        message: 'Candidate not found',
        candidateId: candidateId
      });
    }
    
    // Find all applications for the candidate
    const applications = await Application.findByCandidate(candidateId);
    
    console.log(`✅ Found ${applications.length} applications for candidate`);
    
    // Format the response data
    const formattedApplications = applications.map(app => ({
      id: app._id,
      status: app.status,
      statusColor: app.getStatusColor(),
      appliedAt: app.appliedAt,
      daysOld: app.getDaysOld(),
      job: {
        id: app.jobId._id,
        title: app.jobId.title,
        location: app.jobId.location,
        salary: app.jobId.salary
      },
      candidate: {
        id: app.candidateId._id,
        name: app.candidateId.name,
        email: app.candidateId.email
      },
      resume: {
        id: app.resumeId._id,
        fileUrl: app.resumeId.fileUrl
      },
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${applications.length} applications for candidate`,
      candidateInfo: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email
      },
      count: applications.length,
      data: formattedApplications
    });
    
  } catch (error) {
    console.error('❌ Error fetching candidate applications:', error.message);
    
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
      message: 'Failed to fetch candidate applications',
      details: error.message
    });
  }
});

// PUT /applications/:id - Update application status
// This endpoint allows employers to update the status of applications
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Received request to update application ${id} status to: ${status}`);
    
    // Input validation
    if (!status) {
      return res.status(400).json({
        error: true,
        message: 'Status is required',
        field: 'status'
      });
    }
    
    // Validate status value
    const validStatuses = ['applied', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: true,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        field: 'status',
        validValues: validStatuses
      });
    }
    
    // Find and update the application
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    ).populate([
      { path: 'jobId', select: 'title location salary' },
      { path: 'candidateId', select: 'name email' },
      { path: 'resumeId', select: 'fileUrl' }
    ]);
    
    if (!updatedApplication) {
      return res.status(404).json({
        error: true,
        message: 'Application not found',
        id: id
      });
    }
    
    console.log('✅ Application status updated successfully:', updatedApplication.getDisplayInfo());
    
    // Send success response with updated application data
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        id: updatedApplication._id,
        status: updatedApplication.status,
        statusColor: updatedApplication.getStatusColor(),
        appliedAt: updatedApplication.appliedAt,
        daysOld: updatedApplication.getDaysOld(),
        job: {
          id: updatedApplication.jobId._id,
          title: updatedApplication.jobId.title,
          location: updatedApplication.jobId.location,
          salary: updatedApplication.jobId.salary
        },
        candidate: {
          id: updatedApplication.candidateId._id,
          name: updatedApplication.candidateId.name,
          email: updatedApplication.candidateId.email
        },
        resume: {
          id: updatedApplication.resumeId._id,
          fileUrl: updatedApplication.resumeId.fileUrl
        },
        updatedAt: updatedApplication.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating application status:', error.message);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
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
        message: 'Invalid application ID format',
        id: req.params.id
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to update application status',
      details: error.message
    });
  }
});

// GET /applications - Get all applications (for admin/testing purposes)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Received request to get all applications');
    
    // Get all applications with full details
    const applications = await Application.find()
      .populate('jobId', 'title location salary')
      .populate('candidateId', 'name email')
      .populate('resumeId', 'fileUrl')
      .sort({ appliedAt: -1 });
    
    console.log(`✅ Found ${applications.length} applications`);
    
    // Format the response data
    const formattedApplications = applications.map(app => ({
      id: app._id,
      status: app.status,
      statusColor: app.getStatusColor(),
      appliedAt: app.appliedAt,
      daysOld: app.getDaysOld(),
      job: {
        id: app.jobId._id,
        title: app.jobId.title,
        location: app.jobId.location,
        salary: app.jobId.salary
      },
      candidate: {
        id: app.candidateId._id,
        name: app.candidateId.name,
        email: app.candidateId.email
      },
      resume: {
        id: app.resumeId._id,
        fileUrl: app.resumeId.fileUrl
      },
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${applications.length} applications`,
      count: applications.length,
      data: formattedApplications
    });
    
  } catch (error) {
    console.error('❌ Error fetching applications:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch applications',
      details: error.message
    });
  }
});

// Export the router so it can be used in server.js
module.exports = router;

/*
USAGE EXAMPLES:

1. Submit a job application:
   POST /apply
   {
     "jobId": "60f7b3b3b3b3b3b3b3b3b3b3",
     "candidateId": "60f7b3b3b3b3b3b3b3b3b3b4",
     "resumeId": "60f7b3b3b3b3b3b3b3b3b3b5"
   }

2. Get applications for a candidate:
   GET /applications/60f7b3b3b3b3b3b3b3b3b3b4

3. Update application status:
   PUT /applications/60f7b3b3b3b3b3b3b3b3b3b6
   {
     "status": "shortlisted"
   }

4. Get all applications:
   GET /applications

RESPONSE FORMATS:

Success Response (Application Submission):
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "status": "applied",
    "appliedAt": "2023-07-21T10:30:00.000Z",
    "daysOld": 1,
    "job": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Software Developer",
      "location": "New York",
      "salary": 75000
    },
    "candidate": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "resume": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "fileUrl": "https://example.com/resume.pdf"
    }
  }
}
*/