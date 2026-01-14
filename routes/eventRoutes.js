// routes/eventRoutes.js - This file handles all event-related API endpoints

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /events - Create a new event
// This endpoint allows us to add a new event to the database
router.post('/', async (req, res) => {
  try {
    // Get event data from request body
    const { title, description, date } = req.body;
    
    // Create a new event object
    const event = new Event({
      title,
      description,
      date
    });
    
    // Save the event to database
    await event.save();
    
    // Send success response
    res.status(201).json({
      message: 'Event created successfully',
      event: event
    });
    
  } catch (error) {
    // If something goes wrong, send error response
    res.status(500).json({ 
      error: 'Error creating event',
      details: error.message 
    });
  }
});

// GET /events - Get all events
// This endpoint returns a list of all events in the database
router.get('/', async (req, res) => {
  try {
    // Find all events in the database
    const events = await Event.find();
    
    // Send the list of events
    res.status(200).json({
      message: 'Events retrieved successfully',
      count: events.length,
      events: events
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching events',
      details: error.message 
    });
  }
});

// GET /events/:id - Get a specific event by ID
// This endpoint returns details of a single event
router.get('/:id', async (req, res) => {
  try {
    // Get the event ID from URL parameter
    const eventId = req.params.id;
    
    // Find the event by ID
    const event = await Event.findById(eventId);
    
    // If event not found, send 404 error
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found' 
      });
    }
    
    // Send the event details
    res.status(200).json({
      message: 'Event retrieved successfully',
      event: event
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching event',
      details: error.message 
    });
  }
});

module.exports = router;
