// Candidate Model - Represents job seekers who apply for positions
// This file defines the structure and validation rules for candidate data

const mongoose = require('mongoose');

// Define the Candidate schema
// A schema defines what fields each candidate document should have
const candidateSchema = new mongoose.Schema({
  
  // Candidate Name field
  name: {
    type: String,           // Data type is string
    required: [true, 'Candidate name is required'],  // This field is mandatory
    trim: true,             // Remove extra spaces from beginning and end
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  // Email field
  email: {
    type: String,           // Data type is string
    required: [true, 'Email is required'],  // This field is mandatory
    unique: true,           // No two candidates can have the same email
    lowercase: true,        // Convert to lowercase before saving
    trim: true,             // Remove extra spaces
    
    // Email format validation using regular expression
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
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
// Index on email for faster lookups (since it's unique)
candidateSchema.index({ email: 1 });

// Index on name for search functionality
candidateSchema.index({ name: 1 });
// Pre-save middleware - runs before saving to database
candidateSchema.pre('save', function(next) {
  // 'this' refers to the candidate document being saved
  
  // Log when a new candidate is being created (for debugging)
  if (this.isNew) {
    console.log(`📝 Creating new candidate: ${this.name}`);
  }
  
  // Continue with the save operation
  next();
});

// Instance methods - functions that can be called on individual candidate documents
candidateSchema.methods.getDisplayName = function() {
  // Return a formatted display name for the candidate
  return `${this.name} (${this.email})`;
};

// Static methods - functions that can be called on the Candidate model itself
candidateSchema.statics.findByEmail = function(email) {
  // Find a candidate by email address
  return this.findOne({ email: email.toLowerCase() });
};

candidateSchema.statics.searchByName = function(searchTerm) {
  // Search candidates by name (case-insensitive)
  return this.find({
    name: { $regex: searchTerm, $options: 'i' }
  });
};

// Create and export the Candidate model
// The model is what we use to interact with the candidates collection in MongoDB
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;

/*
HOW TO USE THIS MODEL:

1. Create a new candidate:
   const newCandidate = new Candidate({
     name: 'John Doe',
     email: 'john@example.com'
   });
   await newCandidate.save();

2. Find a candidate:
   const candidate = await Candidate.findById(candidateId);
   const candidate = await Candidate.findByEmail('john@example.com');

3. Update a candidate:
   await Candidate.findByIdAndUpdate(candidateId, { name: 'John Smith' });

4. Delete a candidate:
   await Candidate.findByIdAndDelete(candidateId);

5. Get all candidates:
   const candidates = await Candidate.find();
*/