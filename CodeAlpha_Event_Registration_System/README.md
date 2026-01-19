# 🎟️ Event Registration System (Backend)

A simple and beginner-friendly **Event Registration System Backend** built using **Node.js, Express.js, MongoDB, and Mongoose**.
This project demonstrates RESTful API design, database relationships, and clean backend structuring.

---

## 🚀 Features

* Create and manage users
* Create and manage events
* Register users for events
* View event registrations
* Prevent duplicate registrations
* RESTful API design
* MongoDB integration using Mongoose

---

## 🛠️ Tech Stack

* **Node.js** – JavaScript runtime
* **Express.js** – Backend framework
* **MongoDB** – NoSQL database
* **Mongoose** – ODM for MongoDB
* **Postman** – API testing

---

## 📁 Project Structure

```
CodeAlpha_event-registration-system/
│
├── models/
│   ├── User.js
│   ├── Event.js
│   └── Registration.js
│
├── routes/
│   ├── userRoutes.js
│   ├── eventRoutes.js
│   └── registrationRoutes.js
│
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 📌 API Endpoints

### 👤 User APIs

| Method | Endpoint | Description       |
| ------ | -------- | ----------------- |
| POST   | `/users` | Create a new user |
| GET    | `/users` | Get all users     |

---

### 📅 Event APIs

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| POST   | `/events`     | Create a new event |
| GET    | `/events`     | Get all events     |
| GET    | `/events/:id` | Get event by ID    |

---

### 🔗 Registration APIs

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| POST   | `/registrations`         | Register user for an event |
| GET    | `/registrations/:userId` | Get user registrations     |
| DELETE | `/registrations/:id`     | Cancel registration        |

---

## 🧠 Database Design

### User Model

* Name
* Email

### Event Model

* Title
* Description
* Date

### Registration Model

* User reference
* Event reference
* Registration date

This design represents a **many-to-many relationship** between users and events.

---

## ▶️ How to Run the Project

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Luckwoon02/CodeAlpha_event-registration-system.git
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start MongoDB

Make sure MongoDB is running locally or update the MongoDB connection string.

### 4️⃣ Start the server

```bash
npm start
```

Server will run on:

```
http://localhost:3000
```

---

## 🧪 Testing APIs

Use **Postman** or **Thunder Client** to test the APIs.

---

## 📈 Future Improvements

* User authentication (JWT)
* Role-based access (Admin/User)
* Input validation
* Pagination & filtering
* Better error handling
* Deployment using Docker

---

## 👨‍💻 Author

**Kaushik Ghosh**
Backend Developer | BCA Student

---

## ⭐ Acknowledgment

This project was developed as part of a **CodeAlpha Internship Task** to practice backend development fundamentals.

---

## 📄 License

This project is open-source and available for learning purposes.
