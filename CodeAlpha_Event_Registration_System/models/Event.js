// models/Event.js - This file defines the Event schema/structure

const mongoose = require('mongoose');

// Define the structure of an Event document
const eventSchema = new mongoose.Schema({
  // Event title/name
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Event description - what the event is about
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Event date - when the event will happen
  date: {
    type: Date,
    required: true
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the Event model
// This model will be used to interact with the 'events' collection in MongoDB
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
