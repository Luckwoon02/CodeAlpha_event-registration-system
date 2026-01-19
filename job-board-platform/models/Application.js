// Application Model - Represents job applications submitted by candidates
// This file defines the structure and validation rules for application data

const mongoose = require('mongoose');

// Define the Application schema
// A schema defines what fields each application document should have
const applicationSchema = new mongoose.Schema({
  
  // Job ID field - references the Job being applied for
  jobId: {
    type: mongoose.Schema.Types.ObjectId,  // Special type for MongoDB object IDs
    ref: 'Job',             // This references the Job model
    required: [true, 'Job ID is required'],  // This field is mandatory
    
    // Custom validation to ensure the job exists
    validate: {
      validator: async function(jobId) {
        const Job = mongoose.model('Job');
        const job = await Job.findById(jobId);
        return !!job;  // Return true if job exists, false otherwise
      },
      message: 'Referenced job does not exist'
    }
  },
  
  // Candidate ID field - references the Candidate applying for the job
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
  
  // Resume ID field - references the Resume being submitted with the application
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,  // Special type for MongoDB object IDs
    ref: 'Resume',          // This references the Resume model
    required: [true, 'Resume ID is required'],  // This field is mandatory
    
    // Custom validation to ensure the resume exists and belongs to the candidate
    validate: {
      validator: async function(resumeId) {
        const Resume = mongoose.model('Resume');
        const resume = await Resume.findById(resumeId);
        if (!resume) return false;
        
        // Check if the resume belongs to the same candidate applying
        return resume.candidateId.toString() === this.candidateId.toString();
      },
      message: 'Resume must belong to the applying candidate'
    }
  },
  
  // Application Status field
  status: {
    type: String,           // Data type is string
    enum: {                 // Only allow specific values
      values: ['applied', 'shortlisted', 'rejected'],
      message: 'Status must be either applied, shortlisted, or rejected'
    },
    default: 'applied',     // Default value when creating new application
    required: [true, 'Application status is required']
  },
  
  // Application Date field
  appliedAt: {
    type: Date,             // Data type is date
    default: Date.now,      // Default to current date/time
    required: [true, 'Application date is required']
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
// Index on candidateId for finding applications by candidate
applicationSchema.index({ candidateId: 1 });

// Index on jobId for finding applications for a job
applicationSchema.index({ jobId: 1 });

// Index on status for filtering by application status
applicationSchema.index({ status: 1 });

// Index on appliedAt for sorting by application date
applicationSchema.index({ appliedAt: -1 });

// Compound index to prevent duplicate applications (same candidate + job)
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
// Pre-save middleware - runs before saving to database
applicationSchema.pre('save', function(next) {
  // 'this' refers to the application document being saved
  
  // Log when a new application is being created (for debugging)
  if (this.isNew) {
    console.log(`📝 Creating new application: Candidate ${this.candidateId} applying for Job ${this.jobId}`);
  }
  
  // Continue with the save operation
  next();
});

// Post-save middleware - runs after saving to database
applicationSchema.post('save', function(doc) {
  // Log successful application creation
  console.log(`✅ Application created successfully with status: ${doc.status}`);
});

// Pre-update middleware - runs before updating application
applicationSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // If status is being updated, log the change
  if (update.status) {
    console.log(`🔄 Application status being updated to: ${update.status}`);
  }
  
  next();
});

// Post-update middleware - runs after updating application
applicationSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    // Log notification when status changes (simulating employer notification)
    console.log(`📧 NOTIFICATION: Application ${doc._id} status changed to "${doc.status}"`);
    console.log(`   Job: ${doc.jobId}`);
    console.log(`   Candidate: ${doc.candidateId}`);
    console.log(`   Updated at: ${new Date().toLocaleString()}`);
  }
});

// Instance methods - functions that can be called on individual application documents
applicationSchema.methods.getDisplayInfo = function() {
  // Return a formatted display string for the application
  return `Application ${this._id} - Status: ${this.status}`;
};

applicationSchema.methods.getStatusColor = function() {
  // Return a color code for the status (useful for UI)
  const colors = {
    'applied': 'blue',
    'shortlisted': 'green',
    'rejected': 'red'
  };
  return colors[this.status] || 'gray';
};

applicationSchema.methods.getDaysOld = function() {
  // Calculate how many days old the application is
  const now = new Date();
  const applied = new Date(this.appliedAt);
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Static methods - functions that can be called on the Application model itself
applicationSchema.statics.findByCandidate = function(candidateId) {
  // Find all applications for a specific candidate
  return this.find({ candidateId })
    .populate('jobId', 'title location salary')
    .populate('candidateId', 'name email')
    .populate('resumeId', 'fileUrl')
    .sort({ appliedAt: -1 });
};

applicationSchema.statics.findByJob = function(jobId) {
  // Find all applications for a specific job
  return this.find({ jobId })
    .populate('jobId', 'title location salary')
    .populate('candidateId', 'name email')
    .populate('resumeId', 'fileUrl')
    .sort({ appliedAt: -1 });
};

applicationSchema.statics.findByStatus = function(status) {
  // Find all applications with a specific status
  return this.find({ status })
    .populate('jobId', 'title location salary')
    .populate('candidateId', 'name email')
    .populate('resumeId', 'fileUrl')
    .sort({ appliedAt: -1 });
};

applicationSchema.statics.getApplicationStats = function() {
  // Get statistics about applications
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Create and export the Application model
// The model is what we use to interact with the applications collection in MongoDB
const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

/*
HOW TO USE THIS MODEL:

1. Create a new application:
   const newApplication = new Application({
     jobId: '60f7b3b3b3b3b3b3b3b3b3b3',
     candidateId: '60f7b3b3b3b3b3b3b3b3b3b4',
     resumeId: '60f7b3b3b3b3b3b3b3b3b3b5'
   });
   await newApplication.save();

2. Find applications:
   const applications = await Application.findByCandidate(candidateId);
   const jobApplications = await Application.findByJob(jobId);

3. Update application status:
   await Application.findByIdAndUpdate(applicationId, { status: 'shortlisted' });

4. Get application statistics:
   const stats = await Application.getApplicationStats();

5. Get all applications with full details:
   const applications = await Application.find()
     .populate('jobId candidateId resumeId');
*/