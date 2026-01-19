// Resume Model - Represents resume documents uploaded by candidates
// This file defines the structure and validation rules for resume data

const mongoose = require('mongoose');

// Define the Resume schema
// A schema defines what fields each resume document should have
const resumeSchema = new mongoose.Schema({
  
  // Candidate ID field - references the Candidate who owns this resume
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,  // Special type for MongoDB object IDs
    ref: 'Candidate',       // This references the Candidate model
    required: [true, 'Candidate ID is required'],  // This field is mandatory
    
    // Custom validation to ensure the candidate exists
    validate: {
      validator: async function(candidateId) {
        const Candidate = mongoose.model('Candidate');
        const candidate = await Candidate.findById(candidateId);
        return !!candidate;  // Return true if candidate exists, false otherwise
      },
      message: 'Referenced candidate does not exist'
    }
  },
  
  // File URL field - stores the URL/path to the resume file
  fileUrl: {
    type: String,           // Data type is string
    required: [true, 'Resume file URL is required'],  // This field is mandatory
    trim: true,             // Remove extra spaces
    
    // Basic URL format validation
    validate: {
      validator: function(url) {
        // Simple URL validation - should start with http/https or be a file path
        return /^(https?:\/\/|\/|\.\/|\w+:\/\/)/.test(url) || url.length > 0;
      },
      message: 'Please provide a valid file URL or path'
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
// Index on candidateId for finding resumes by candidate
resumeSchema.index({ candidateId: 1 });

// Index on createdAt for sorting by upload date
resumeSchema.index({ createdAt: -1 });

// Pre-save middleware - runs before saving to database
resumeSchema.pre('save', function(next) {
  // 'this' refers to the resume document being saved
  
  // Log when a new resume is being created (for debugging)
  if (this.isNew) {
    console.log(`📄 Creating new resume for candidate: ${this.candidateId}`);
  }
  
  // Continue with the save operation
  next();
});

// Instance methods - functions that can be called on individual resume documents
resumeSchema.methods.getDisplayInfo = function() {
  // Return a formatted display string for the resume
  return `Resume for candidate ${this.candidateId} - ${this.fileUrl}`;
};

resumeSchema.methods.getFileExtension = function() {
  // Extract file extension from URL
  const url = this.fileUrl;
  const lastDot = url.lastIndexOf('.');
  return lastDot > 0 ? url.substring(lastDot + 1).toLowerCase() : 'unknown';
};
// Static methods - functions that can be called on the Resume model itself
resumeSchema.statics.findByCandidate = function(candidateId) {
  // Find all resumes for a specific candidate
  return this.find({ candidateId }).populate('candidateId', 'name email');
};

resumeSchema.statics.findRecentResumes = function(limit = 10) {
  // Find the most recently uploaded resumes
  return this.find()
    .populate('candidateId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Create and export the Resume model
// The model is what we use to interact with the resumes collection in MongoDB
const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;

/*
HOW TO USE THIS MODEL:

1. Create a new resume:
   const newResume = new Resume({
     candidateId: '60f7b3b3b3b3b3b3b3b3b3b3',
     fileUrl: 'https://example.com/resume.pdf'
   });
   await newResume.save();

2. Find resumes:
   const resume = await Resume.findById(resumeId);
   const resumes = await Resume.findByCandidate(candidateId);

3. Update a resume:
   await Resume.findByIdAndUpdate(resumeId, { fileUrl: 'new-url.pdf' });

4. Delete a resume:
   await Resume.findByIdAndDelete(resumeId);

5. Get all resumes with candidate info:
   const resumes = await Resume.find().populate('candidateId', 'name email');
*/