// routes/registrationRoutes.js - This file handles all registration-related API endpoints

const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const User = require('../models/User');
const Event = require('../models/Event');

// POST /register - Register a user for an event
// This endpoint creates a connection between a user and an event
router.post('/register', async (req, res) => {
  try {
    // Get userId and eventId from request body
    const { userId, eventId } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }
    
    // Check if user is already registered for this event
    const existingRegistration = await Registration.findOne({ 
      userId, 
      eventId 
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        error: 'User is already registered for this event' 
      });
    }
    
    // Create a new registration
    const registration = new Registration({
      userId,
      eventId
    });
    
    // Save the registration to database
    await registration.save();
    
    // Send success response
    res.status(201).json({
      message: 'Registration successful',
      registration: registration
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Error creating registration',
      details: error.message 
    });
  }
});

// GET /registrations/:userId - Get all registrations of a specific user
// This endpoint shows all events a user has registered for
router.get('/registrations/:userId', async (req, res) => {
  try {
    // Get userId from URL parameter
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Find all registrations for this user
    // .populate() fills in the actual event details instead of just the ID
    const registrations = await Registration.find({ userId })
      .populate('eventId');  // This replaces eventId with full event details
    
    // Send the list of registrations
    res.status(200).json({
      message: 'Registrations retrieved successfully',
      user: user.name,
      count: registrations.length,
      registrations: registrations
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching registrations',
      details: error.message 
    });
  }
});

// DELETE /registrations/:id - Cancel a registration
// This endpoint allows a user to cancel their event registration
router.delete('/registrations/:id', async (req, res) => {
  try {
    // Get registration ID from URL parameter
    const registrationId = req.params.id;
    
    // Find and delete the registration
    const registration = await Registration.findByIdAndDelete(registrationId);
    
    // If registration not found, send 404 error
    if (!registration) {
      return res.status(404).json({ 
        error: 'Registration not found' 
      });
    }
    
    // Send success response
    res.status(200).json({
      message: 'Registration cancelled successfully',
      cancelledRegistration: registration
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Error cancelling registration',
      details: error.message 
    });
  }
});

module.exports = router;
