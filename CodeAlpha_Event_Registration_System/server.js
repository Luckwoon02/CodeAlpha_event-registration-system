// server.js - This is the main entry point of our application
// It sets up the Express server and connects to MongoDB

// Import required packages
const express = require('express');
const mongoose = require('mongoose');

// Import our route files
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

// Create an Express application
const app = express();

// Middleware to parse JSON data from requests
// This allows us to read req.body in our routes
app.use(express.json());

// MongoDB Connection String
// Replace 'your_database_name' with your actual database name
const MONGODB_URI = 'mongodb://localhost:27017/event_registration_db';

// Connect to MongoDB database
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB database');
  })
  .catch((error) => {
    console.log('❌ Error connecting to MongoDB:', error.message);
  });

// Register our routes
// All user-related endpoints will start with /users
app.use('/users', userRoutes);

// All event-related endpoints will start with /events
app.use('/events', eventRoutes);

// All registration-related endpoints will start with /register or /registrations
app.use('/', registrationRoutes);

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Event Registration System API',
    status: 'Server is running'
  });
});

// Define the port number where server will run
const PORT = 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
