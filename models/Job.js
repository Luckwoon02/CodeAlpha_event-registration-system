// Job Model - Represents job postings created by employers
// This file defines the structure and validation rules for job data

const mongoose = require('mongoose');

// Define the Job schema
// A schema defines what fields each job document should have and their validation rules
const jobSchema = new mongoose.Schema({
  
  // Job Title field
  title: {
    type: String,           // Data type is string
    required: [true, 'Job title is required'],  // This field is mandatory
    trim: true,             // Remove extra spaces from beginning and end
    minlength: [3, 'Job title must be at least 3 characters long'],
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  
  // Job Description field
  description: {
    type: String,           // Data type is string
    required: [true, 'Job description is required'],  // This field is mandatory
    trim: true,             // Remove extra spaces
    minlength: [10, 'Job description must be at least 10 characters long'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  
  // Job Location field
  location: {
    type: String,           // Data type is string
    required: [true, 'Job location is required'],  // This field is mandatory
    trim: true,             // Remove extra spaces
    minlength: [2, 'Location must be at least 2 characters long'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  
  // Salary field
  salary: {
    type: Number,           // Data type is number
    required: [true, 'Salary is required'],  // This field is mandatory
    min: [0, 'Salary cannot be negative'],   // Minimum value validation
    max: [10000000, 'Salary cannot exceed 10,000,000']  // Maximum value validation
  },
  
  // Employer ID field - references the Employer who posted this job
  employerId: {
    type: mongoose.Schema.Types.ObjectId,  // Special type for MongoDB object IDs
    ref: 'Employer',        // This references the Employer model
    required: [true, 'Employer ID is required'],  // This field is mandatory
    
    // Custom validation to ensure the employer exists
    validate: {
      validator: async function(employerId) {
        const Employer = mongoose.model('Employer');
        const employer = await Employer.findById(employerId);
        return !!employer;  // Return true if employer exists, false otherwise
      },
      message: 'Referenced employer does not exist'
    }
  }
  
}, {
  // Schema options
  timestamps: true,  // Automatically add createdAt and updatedAt fields
  
  // Transform the output when converting to JSON (for API responses)
  toJSON: {
    transform: function(doc, ret) {
      // Remove the __v field (version key) from API responses
      delete ret.__v;
      return ret;
    }
  }
});

// Add indexes for better query performance
// Index on title for search functionality
jobSchema.index({ title: 1 });

// Index on location for search functionality
jobSchema.index({ location: 1 });

// Index on salary for filtering/sorting
jobSchema.index({ salary: 1 });

// Index on employerId for finding jobs by employer
jobSchema.index({ employerId: 1 });

// Compound index for text search on title and location
jobSchema.index({ title: 'text', location: 'text', description: 'text' });

// Pre-save middleware - runs before saving to database
jobSchema.pre('save', function(next) {
  // 'this' refers to the job document being saved
  
  // Log when a new job is being created (for debugging)
  if (this.isNew) {
    console.log(`📝 Creating new job: ${this.title} at ${this.location}`);
  }
  
  // Continue with the save operation
  next();
});

// Instance methods - functions that can be called on individual job documents
jobSchema.methods.getDisplayInfo = function() {
  // Return a formatted display string for the job
  return `${this.title} - ${this.location} ($${this.salary.toLocaleString()})`;
};

jobSchema.methods.getSalaryRange = function() {
  // Categorize salary into ranges for display
  if (this.salary < 50000) return 'Entry Level';
  if (this.salary < 100000) return 'Mid Level';
  if (this.salary < 200000) return 'Senior Level';
  return 'Executive Level';
};

// Static methods - functions that can be called on the Job model itself
jobSchema.statics.findByEmployer = function(employerId) {
  // Find all jobs posted by a specific employer
  return this.find({ employerId }).populate('employerId', 'companyName email');
};

jobSchema.statics.searchJobs = function(searchTerm, location) {
  // Search jobs by title and/or location
  const query = {};
  
  if (searchTerm) {
    // Use text search for title and description
    query.$text = { $search: searchTerm };
  }
  
  if (location) {
    // Use case-insensitive regex for location search
    query.location = { $regex: location, $options: 'i' };
  }
  
  return this.find(query)
    .populate('employerId', 'companyName email')
    .sort({ createdAt: -1 });
};

jobSchema.statics.findBySalaryRange = function(minSalary, maxSalary) {
  // Find jobs within a salary range
  const query = {};
  
  if (minSalary) query.salary = { $gte: minSalary };
  if (maxSalary) {
    if (query.salary) {
      query.salary.$lte = maxSalary;
    } else {
      query.salary = { $lte: maxSalary };
    }
  }
  
  return this.find(query)
    .populate('employerId', 'companyName email')
    .sort({ salary: -1 });
};

// Create and export the Job model
// The model is what we use to interact with the jobs collection in MongoDB
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

/*
HOW TO USE THIS MODEL:

1. Create a new job:
   const newJob = new Job({
     title: 'Software Developer',
     description: 'Build amazing applications',
     location: 'New York',
     salary: 75000,
     employerId: '60f7b3b3b3b3b3b3b3b3b3b3'
   });
   await newJob.save();

2. Find jobs:
   const job = await Job.findById(jobId);
   const jobs = await Job.findByEmployer(employerId);
   const searchResults = await Job.searchJobs('developer', 'New York');

3. Update a job:
   await Job.findByIdAndUpdate(jobId, { salary: 80000 });

4. Delete a job:
   await Job.findByIdAndDelete(jobId);

5. Get all jobs with employer info:
   const jobs = await Job.find().populate('employerId', 'companyName email');
*/