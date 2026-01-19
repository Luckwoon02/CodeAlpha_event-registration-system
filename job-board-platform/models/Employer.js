// Employer Model - Represents companies that post job opportunities
// This file defines the structure and validation rules for employer data

const mongoose = require('mongoose');

// Define the Employer schema
// A schema is like a blueprint that tells MongoDB what fields each employer document should have
const employerSchema = new mongoose.Schema({
  
  // Company Name field
  companyName: {
    type: String,           // Data type is string
    required: [true, 'Company name is required'],  // This field is mandatory
    trim: true,             // Remove extra spaces from beginning and end
    minlength: [2, 'Company name must be at least 2 characters long'],
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  
  // Email field
  email: {
    type: String,           // Data type is string
    required: [true, 'Email is required'],  // This field is mandatory
    unique: true,           // No two employers can have the same email
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
employerSchema.index({ email: 1 });

// Index on company name for search functionality
employerSchema.index({ companyName: 1 });

// Pre-save middleware - runs before saving to database
employerSchema.pre('save', function(next) {
  // 'this' refers to the employer document being saved
  
  // Log when a new employer is being created (for debugging)
  if (this.isNew) {
    console.log(`📝 Creating new employer: ${this.companyName}`);
  }
  
  // Continue with the save operation
  next();
});

// Instance methods - functions that can be called on individual employer documents
employerSchema.methods.getDisplayName = function() {
  // Return a formatted display name for the employer
  return `${this.companyName} (${this.email})`;
};

// Static methods - functions that can be called on the Employer model itself
employerSchema.statics.findByEmail = function(email) {
  // Find an employer by email address
  return this.findOne({ email: email.toLowerCase() });
};

employerSchema.statics.searchByCompanyName = function(searchTerm) {
  // Search employers by company name (case-insensitive)
  return this.find({
    companyName: { $regex: searchTerm, $options: 'i' }
  });
};

// Create and export the Employer model
// The model is what we use to interact with the employers collection in MongoDB
const Employer = mongoose.model('Employer', employerSchema);

module.exports = Employer;

/*
HOW TO USE THIS MODEL:

1. Create a new employer:
   const newEmployer = new Employer({
     companyName: 'Tech Corp',
     email: 'hr@techcorp.com'
   });
   await newEmployer.save();

2. Find an employer:
   const employer = await Employer.findById(employerId);
   const employer = await Employer.findByEmail('hr@techcorp.com');

3. Update an employer:
   await Employer.findByIdAndUpdate(employerId, { companyName: 'New Name' });

4. Delete an employer:
   await Employer.findByIdAndDelete(employerId);

5. Get all employers:
   const employers = await Employer.find();
*/