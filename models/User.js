// models/User.js - This file defines the User schema/structure

const mongoose = require('mongoose');

// Define the structure of a User document
const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: true,  // This field is mandatory
    trim: true       // Remove extra spaces
  },
  
  // User's email address
  email: {
    type: String,
    required: true,
    unique: true,    // No two users can have the same email
    lowercase: true, // Convert to lowercase
    trim: true
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the User model
// This model will be used to interact with the 'users' collection in MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;
