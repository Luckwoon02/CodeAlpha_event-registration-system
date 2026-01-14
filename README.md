# Event Registration System - Beginner Backend Project

A simple backend API built with Node.js, Express, and MongoDB for managing event registrations.

## 📚 What This Project Does

This is an **Event Registration System** where:
- Users can be created
- Events can be created and viewed
- Users can register for events
- Users can view their registrations
- Users can cancel their registrations

## 🎯 Project Structure

```
event-registration-system/
│
├── models/                    # Database schemas
│   ├── User.js               # User model (name, email)
│   ├── Event.js              # Event model (title, description, date)
│   └── Registration.js       # Registration model (connects users & events)
│
├── routes/                    # API endpoints
│   ├── userRoutes.js         # User-related APIs
│   ├── eventRoutes.js        # Event-related APIs
│   └── registrationRoutes.js # Registration-related APIs
│
├── server.js                  # Main application file
├── package.json              # Project dependencies
└── README.md                 # This file
```

## 🔗 How the Models are Related

```
User ←→ Registration ←→ Event

- A User can register for many Events
- An Event can have many Users registered
- Registration is the "bridge" that connects Users and Events
```

## 🚀 Setup Instructions

### Step 1: Install MongoDB
Make sure MongoDB is installed and running on your computer.
- Download from: https://www.mongodb.com/try/download/community
- Start MongoDB service

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Server
```bash
npm start
```

The server will run on: `http://localhost:3000`

## 📡 API Endpoints

### 1️⃣ User APIs

#### Create a User
- **Method:** POST
- **URL:** `http://localhost:3000/users`
- **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

### 2️⃣ Event APIs

#### Create an Event
- **Method:** POST
- **URL:** `http://localhost:3000/events`
- **Body (JSON):**
```json
{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "date": "2024-12-25"
}
```

#### Get All Events
- **Method:** GET
- **URL:** `http://localhost:3000/events`

#### Get Single Event
- **Method:** GET
- **URL:** `http://localhost:3000/events/:id`
- **Example:** `http://localhost:3000/events/507f1f77bcf86cd799439011`

---

### 3️⃣ Registration APIs

#### Register User for Event
- **Method:** POST
- **URL:** `http://localhost:3000/register`
- **Body (JSON):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "eventId": "507f191e810c19729de860ea"
}
```

#### Get User's Registrations
- **Method:** GET
- **URL:** `http://localhost:3000/registrations/:userId`
- **Example:** `http://localhost:3000/registrations/507f1f77bcf86cd799439011`

#### Cancel Registration
- **Method:** DELETE
- **URL:** `http://localhost:3000/registrations/:id`
- **Example:** `http://localhost:3000/registrations/507f1f77bcf86cd799439011`

---

## 🧪 Testing with Postman

### Step-by-Step Testing Flow:

1. **Create a User**
   - Use POST `/users` endpoint
   - Copy the `_id` from response (this is userId)

2. **Create an Event**
   - Use POST `/events` endpoint
   - Copy the `_id` from response (this is eventId)

3. **Register User for Event**
   - Use POST `/register` endpoint
   - Paste userId and eventId in the body

4. **View User's Registrations**
   - Use GET `/registrations/:userId`
   - Replace `:userId` with actual user ID

5. **Cancel Registration**
   - Use DELETE `/registrations/:id`
   - Replace `:id` with registration ID

---


This is a solid foundation for backend development!
