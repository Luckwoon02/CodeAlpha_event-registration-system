// Job Board Platform - Main Server File
// This is the entry point of our application
// It sets up Express server, connects to MongoDB, and registers all routes

// Import required packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import route modules
const employerRoutes = require('./routes/employerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Create Express application instance
const app = express();

// Set the port number - use environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// MongoDB connection string - in production, this should be in environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-board';

// Mongoose connection options for better reliability
const mongooseOptions = {
  // Use new URL parser
  useNewUrlParser: true,
  // Use new Server Discovery and Monitoring engine
  useUnifiedTopology: true,
  // Timeout after 10 seconds instead of default 30 seconds
  serverSelectionTimeoutMS: 10000,
  // Close connections after 30 seconds of inactivity
  socketTimeoutMS: 30000,
  // Maintain up to 10 socket connections
  maxPoolSize: 10,
  // Maintain at least 5 socket connections
  minPoolSize: 5,
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0
};

// Middleware Configuration
// These functions run before our route handlers

// 1. CORS - allows requests from different origins (frontend applications)
app.use(cors());

// 2. JSON Parser - converts incoming JSON data to JavaScript objects
app.use(express.json());

// 3. URL Encoded Parser - handles form data
app.use(express.urlencoded({ extended: true }));

// Database Connection Function
async function connectToDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Database URI: ${MONGODB_URI}`);
    
    // Connect to MongoDB using Mongoose with options
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    
    console.log('✅ Successfully connected to MongoDB database');
    console.log(`📊 Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Listen for connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    // If connection fails, log detailed error and exit
    console.error('❌ Failed to connect to MongoDB:');
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Make sure MongoDB is running on your system');
      console.error('   - Start MongoDB: mongod');
      console.error('   - Or use MongoDB Atlas cloud database');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('💡 Tip: Check your MongoDB username and password');
    }
    
    process.exit(1); // Exit with error code
  }
}

// Basic route for testing server
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Job Board Platform API',
    version: '1.0.0',
    status: 'Server is running successfully!',
    description: 'A simple job board backend for learning Node.js, Express.js, and MongoDB',
    endpoints: {
      employers: {
        'POST /employers': 'Create new employer',
        'GET /employers': 'Get all employers',
        'GET /employers/:id': 'Get specific employer'
      },
      jobs: {
        'POST /jobs': 'Create new job posting',
        'GET /jobs': 'Get all job postings',
        'GET /jobs/search': 'Search jobs by title/location/salary',
        'GET /jobs/:id': 'Get specific job'
      },
      candidates: {
        'POST /candidates': 'Create new candidate',
        'GET /candidates': 'Get all candidates',
        'GET /candidates/:id': 'Get specific candidate'
      },
      resumes: {
        'POST /resumes': 'Upload resume information',
        'GET /resumes': 'Get all resumes',
        'GET /resumes/candidate/:candidateId': 'Get resumes for candidate',
        'GET /resumes/:id': 'Get specific resume'
      },
      applications: {
        'POST /apply': 'Submit job application',
        'GET /applications/:candidateId': 'Get candidate applications',
        'PUT /applications/:id': 'Update application status',
        'GET /applications': 'Get all applications'
      }
    },
    documentation: {
      'Getting Started': 'See README.md for setup instructions',
      'API Testing': 'Use Postman or similar tool to test endpoints',
      'Database': 'MongoDB with Mongoose ODM',
      'Features': 'Employer registration, job posting, candidate applications'
    }
  });
});

// Register API Routes
// All employer-related routes will be prefixed with /employers
app.use('/employers', employerRoutes);

// All job-related routes will be prefixed with /jobs
app.use('/jobs', jobRoutes);

// All candidate-related routes will be prefixed with /candidates
app.use('/candidates', candidateRoutes);

// All resume-related routes will be prefixed with /resumes
app.use('/resumes', resumeRoutes);

// Application routes - note the different path structure
app.use('/apply', applicationRoutes);  // POST /apply for submitting applications
app.use('/applications', applicationRoutes);  // GET /applications/:candidateId and PUT /applications/:id

// Error handling middleware
// This catches any errors that occur in our routes
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error.message);
  
  // Send error response to client
  res.status(500).json({
    error: true,
    message: 'Internal server error occurred',
    details: error.message
  });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: 'Check the API documentation at the root endpoint (GET /)',
    availableRoutes: {
      employers: ['POST /employers', 'GET /employers', 'GET /employers/:id'],
      jobs: ['POST /jobs', 'GET /jobs', 'GET /jobs/search', 'GET /jobs/:id'],
      candidates: ['POST /candidates', 'GET /candidates', 'GET /candidates/:id'],
      resumes: ['POST /resumes', 'GET /resumes', 'GET /resumes/candidate/:candidateId', 'GET /resumes/:id'],
      applications: ['POST /apply', 'GET /applications/:candidateId', 'PUT /applications/:id', 'GET /applications']
    }
  });
});

// Server Startup Function
async function startServer() {
  try {
    // First connect to database
    await connectToDatabase();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log('🚀 Job Board Platform Server Started!');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log('📚 API Documentation available at: http://localhost:' + PORT);
      console.log('⏰ Started at:', new Date().toLocaleString());
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  
  try {
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Start the server
startServer();

// Export app for testing purposes
module.exports = app;