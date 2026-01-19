# 💼 Job Board Platform Backend

A simple, beginner-friendly job board platform backend built with Node.js, Express.js, and MongoDB. This project is designed to teach fundamental backend development concepts.

## 🛠 Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## 📋 Features

### 🏢 Employers
- Register as an employer
- Post job opportunities

### 📄 Jobs
- Create job postings
- View all available jobs
- Search jobs by title or location

### 👤 Candidates
- Register as a candidate
- Upload resume information

### 📝 Applications
- Apply for jobs
- Track application status
- View application history

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   - **Local MongoDB**: Start with `mongod` command
   - **MongoDB Atlas**: Update connection string in `server.js` (line 13)
   ```javascript
   const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-atlas-connection-string';
   ```

4. **Start the server**
   ```bash
   # Development mode (auto-restart on changes)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Test the API**
   ```bash
   # Automated API testing
   npm run test-api
   
   # Or visit in browser
   http://localhost:3000
   ```

## 📡 API Endpoints

### Employers
- `POST /employers` - Create new employer

### Jobs
- `POST /jobs` - Create job posting
- `GET /jobs` - Get all jobs
- `GET /jobs/search?title=...&location=...` - Search jobs

### Candidates
- `POST /candidates` - Create new candidate

### Resumes
- `POST /resumes` - Upload resume info

### Applications
- `POST /apply` - Apply for a job
- `GET /applications/:candidateId` - Get candidate's applications
- `PUT /applications/:id` - Update application status

## 📚 Project Structure

```
job-board-backend/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── models/                # Database models
│   ├── Employer.js       # Employer data model
│   ├── Job.js            # Job posting model
│   ├── Candidate.js      # Candidate model
│   ├── Resume.js         # Resume model
│   └── Application.js    # Application model
└── routes/               # API routes
    ├── employerRoutes.js # Employer endpoints
    ├── jobRoutes.js      # Job endpoints
    ├── candidateRoutes.js# Candidate endpoints
    ├── resumeRoutes.js   # Resume endpoints
    └── applicationRoutes.js # Application endpoints
```

## 🧪 Testing with Postman

### Quick Test Sequence

1. **Create an Employer**
   ```json
   POST http://localhost:3000/employers
   {
     "companyName": "Tech Corp",
     "email": "hr@techcorp.com"
   }
   ```

2. **Post a Job**
   ```json
   POST http://localhost:3000/jobs
   {
     "title": "Software Developer",
     "description": "Build amazing applications",
     "location": "New York",
     "salary": 75000,
     "employerId": "EMPLOYER_ID_FROM_STEP_1"
   }
   ```

3. **Create a Candidate**
   ```json
   POST http://localhost:3000/candidates
   {
     "name": "John Doe",
     "email": "john@example.com"
   }
   ```

4. **Upload Resume**
   ```json
   POST http://localhost:3000/resumes
   {
     "candidateId": "CANDIDATE_ID_FROM_STEP_3",
     "fileUrl": "https://example.com/resume.pdf"
   }
   ```

5. **Apply for Job**
   ```json
   POST http://localhost:3000/apply
   {
     "jobId": "JOB_ID_FROM_STEP_2",
     "candidateId": "CANDIDATE_ID_FROM_STEP_3",
     "resumeId": "RESUME_ID_FROM_STEP_4"
   }
   ```

6. **Update Application Status**
   ```json
   PUT http://localhost:3000/applications/APPLICATION_ID
   {
     "status": "shortlisted"
   }
   ```

### Automated Testing
```bash
# Run comprehensive API tests
npm run test-api
```

See `EXAMPLES.md` for detailed API documentation and more examples.

## 🎯 Learning Objectives

This project teaches:
- **RESTful API Design** - Creating proper HTTP endpoints
- **Database Modeling** - Designing schemas and relationships
- **Error Handling** - Managing errors gracefully
- **Input Validation** - Ensuring data quality
- **Async/Await** - Handling asynchronous operations
- **Middleware** - Processing requests and responses

## 🔧 Development Tips

1. **Start MongoDB** before running the server
2. **Check console logs** for helpful debugging information
3. **Use Postman** to test API endpoints
4. **Read error messages** carefully - they guide you to solutions
5. **Test one feature at a time** to isolate issues

## 📈 Future Enhancements

- User authentication (JWT)
- File upload for resumes
- Email notifications
- Admin dashboard
- Advanced search filters
- Application analytics

## 🤝 Contributing

This is a learning project! Feel free to:
- Add new features
- Improve error handling
- Add more validation
- Write tests
- Enhance documentation

---

**Happy Coding! 🚀**