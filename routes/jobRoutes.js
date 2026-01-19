// Job Routes - Handles all job-related API endpoints
// This file contains the route handlers for job operations

const express = require('express');
const Job = require('../models/Job');
const Employer = require('../models/Employer');

// Create a router instance
const router = express.Router();

// POST /jobs - Create a new job posting
// This endpoint allows employers to post job opportunities
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received request to create new job');
    console.log('Request body:', req.body);
    
    // Extract data from request body
    const { title, description, location, salary, employerId } = req.body;
    
    // Input validation - check if required fields are provided
    if (!title) {
      return res.status(400).json({
        error: true,
        message: 'Job title is required',
        field: 'title'
      });
    }
    
    if (!description) {
      return res.status(400).json({
        error: true,
        message: 'Job description is required',
        field: 'description'
      });
    }
    
    if (!location) {
      return res.status(400).json({
        error: true,
        message: 'Job location is required',
        field: 'location'
      });
    }
    
    if (!salary) {
      return res.status(400).json({
        error: true,
        message: 'Salary is required',
        field: 'salary'
      });
    }
    
    if (!employerId) {
      return res.status(400).json({
        error: true,
        message: 'Employer ID is required',
        field: 'employerId'
      });
    }
    
    // Validate that the employer exists
    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({
        error: true,
        message: 'Employer not found',
        field: 'employerId'
      });
    }
    
    // Create new job instance
    const newJob = new Job({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      salary: Number(salary),
      employerId: employerId
    });
    
    // Save to database
    const savedJob = await newJob.save();
    
    // Populate employer information for the response
    await savedJob.populate('employerId', 'companyName email');
    
    console.log('✅ Job created successfully:', savedJob.getDisplayInfo());
    
    // Send success response with created job data
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        id: savedJob._id,
        title: savedJob.title,
        description: savedJob.description,
        location: savedJob.location,
        salary: savedJob.salary,
        salaryRange: savedJob.getSalaryRange(),
        employer: {
          id: savedJob.employerId._id,
          companyName: savedJob.employerId.companyName,
          email: savedJob.employerId.email
        },
        createdAt: savedJob.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating job:', error.message);
    
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
        message: 'Invalid employer ID format',
        field: 'employerId'
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: true,
      message: 'Failed to create job',
      details: error.message
    });
  }
});

// GET /jobs - Get all job postings
// This endpoint returns all available jobs with employer information
router.get('/', async (req, res) => {
  try {
    console.log('📋 Received request to get all jobs');
    
    // Get all jobs from database with employer information
    const jobs = await Job.find()
      .populate('employerId', 'companyName email')  // Include employer details
      .sort({ createdAt: -1 });  // Sort by newest first
    
    console.log(`✅ Found ${jobs.length} jobs`);
    
    // Format the response data
    const formattedJobs = jobs.map(job => ({
      id: job._id,
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      salaryRange: job.getSalaryRange(),
      employer: {
        id: job.employerId._id,
        companyName: job.employerId.companyName,
        email: job.employerId.email
      },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${jobs.length} jobs`,
      count: jobs.length,
      data: formattedJobs
    });
    
  } catch (error) {
    console.error('❌ Error fetching jobs:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch jobs',
      details: error.message
    });
  }
});

// GET /jobs/search - Search jobs by title and/or location
// This endpoint allows filtering jobs based on search criteria
router.get('/search', async (req, res) => {
  try {
    // Extract search parameters from query string
    const { title, location, minSalary, maxSalary } = req.query;
    
    console.log('🔍 Received job search request');
    console.log('Search parameters:', { title, location, minSalary, maxSalary });
    
    // Build search query
    let jobs;
    
    if (minSalary || maxSalary) {
      // Search by salary range
      jobs = await Job.findBySalaryRange(
        minSalary ? Number(minSalary) : null,
        maxSalary ? Number(maxSalary) : null
      );
    } else {
      // Search by title and/or location
      jobs = await Job.searchJobs(title, location);
    }
    
    console.log(`✅ Found ${jobs.length} matching jobs`);
    
    // Format the response data
    const formattedJobs = jobs.map(job => ({
      id: job._id,
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      salaryRange: job.getSalaryRange(),
      employer: {
        id: job.employerId._id,
        companyName: job.employerId.companyName,
        email: job.employerId.email
      },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${jobs.length} matching jobs`,
      searchCriteria: { title, location, minSalary, maxSalary },
      count: jobs.length,
      data: formattedJobs
    });
    
  } catch (error) {
    console.error('❌ Error searching jobs:', error.message);
    
    res.status(500).json({
      error: true,
      message: 'Failed to search jobs',
      details: error.message
    });
  }
});

// GET /jobs/:id - Get a specific job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Received request to get job with ID: ${id}`);
    
    // Find job by ID with employer information
    const job = await Job.findById(id).populate('employerId', 'companyName email');
    
    if (!job) {
      return res.status(404).json({
        error: true,
        message: 'Job not found',
        id: id
      });
    }
    
    console.log('✅ Job found:', job.getDisplayInfo());
    
    res.status(200).json({
      success: true,
      message: 'Job found',
      data: {
        id: job._id,
        title: job.title,
        description: job.description,
        location: job.location,
        salary: job.salary,
        salaryRange: job.getSalaryRange(),
        employer: {
          id: job.employerId._id,
          companyName: job.employerId.companyName,
          email: job.employerId.email
        },
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching job:', error.message);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid job ID format',
        id: req.params.id
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to fetch job',
      details: error.message
    });
  }
});

// Export the router so it can be used in server.js
module.exports = router;

/*
USAGE EXAMPLES:

1. Create a job:
   POST /jobs
   {
     "title": "Software Developer",
     "description": "Build amazing applications using React and Node.js",
     "location": "New York",
     "salary": 75000,
     "employerId": "60f7b3b3b3b3b3b3b3b3b3b3"
   }

2. Get all jobs:
   GET /jobs

3. Search jobs by title:
   GET /jobs/search?title=developer

4. Search jobs by location:
   GET /jobs/search?location=new york

5. Search jobs by title and location:
   GET /jobs/search?title=developer&location=new york

6. Search jobs by salary range:
   GET /jobs/search?minSalary=50000&maxSalary=100000

7. Get specific job:
   GET /jobs/60f7b3b3b3b3b3b3b3b3b3b3

RESPONSE FORMATS:

Success Response:
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Software Developer",
    "description": "Build amazing applications",
    "location": "New York",
    "salary": 75000,
    "salaryRange": "Mid Level",
    "employer": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "companyName": "Tech Corp",
      "email": "hr@techcorp.com"
    },
    "createdAt": "2023-07-21T10:30:00.000Z"
  }
}
*/