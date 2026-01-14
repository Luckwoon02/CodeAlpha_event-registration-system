// models/Registration.js - This file defines the Registration schema/structure
// Registration connects Users and Events (a user registers for an event)

const mongoose = require('mongoose');

// Define the structure of a Registration document
const registrationSchema = new mongoose.Schema({
  // Reference to the User who is registering
  // This creates a relationship between Registration and User
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Store MongoDB ObjectId
    ref: 'User',                            // Reference to User model
    required: true
  },
  
  // Reference to the Event being registered for
  // This creates a relationship between Registration and Event
  eventId: {
    type: mongoose.Schema.Types.ObjectId,  // Store MongoDB ObjectId
    ref: 'Event',                           // Reference to Event model
    required: true
  },
  
  // When the registration was made
  registeredAt: {
    type: Date,
    default: Date.now  // Automatically set to current date/time
  }
}, {
  timestamps: true
});

// Create and export the Registration model
// This model will be used to interact with the 'registrations' collection in MongoDB
const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
