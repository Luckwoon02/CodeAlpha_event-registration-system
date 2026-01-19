# 🚀 Job Board Platform - Deployment Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Luckwoon02/CodeAlpha_tasks.git
   cd "CodeAlpha_tasks/Job Board Platform"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MongoDB:**
   - **Local MongoDB:** Start with `mongod` command
   - **MongoDB Atlas:** Update connection string in `server.js`

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Test the API:**
   ```bash
   npm run test-api
   ```

## 🌐 Production Deployment

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku app:**
   ```bash
   heroku create your-job-board-app
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
   heroku config:set PORT=3000
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 2: Railway Deployment

1. **Connect GitHub repository to Railway**
2. **Set environment variables:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: 3000

3. **Deploy automatically from GitHub**

### Option 3: Render Deployment

1. **Connect GitHub repository to Render**
2. **Set build command:** `npm install`
3. **Set start command:** `npm start`
4. **Set environment variables:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string

## 🔧 Environment Variables

Create a `.env` file for local development:

```env
MONGODB_URI=mongodb://localhost:27017/job-board
PORT=3000
NODE_ENV=development
```

For production, set these in your hosting platform:

- `MONGODB_URI`: MongoDB Atlas connection string
- `PORT`: Server port (usually set automatically by hosting platform)
- `NODE_ENV`: production

## 📊 MongoDB Atlas Setup

1. **Create MongoDB Atlas account**
2. **Create a new cluster**
3. **Create database user**
4. **Whitelist IP addresses (0.0.0.0/0 for all IPs)**
5. **Get connection string and update in environment variables**

## 🧪 Testing in Production

After deployment, test your API endpoints:

```bash
# Replace YOUR_DEPLOYED_URL with your actual URL
curl https://YOUR_DEPLOYED_URL.herokuapp.com/

# Test creating an employer
curl -X POST https://YOUR_DEPLOYED_URL.herokuapp.com/employers \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test Company", "email": "test@company.com"}'
```

## 🔍 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**
   - Check MONGODB_URI environment variable
   - Ensure IP is whitelisted in MongoDB Atlas
   - Verify database user credentials

2. **Port Issues:**
   - Ensure PORT environment variable is set
   - Check if port is available

3. **Dependencies Issues:**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version compatibility

### Logs:

- **Heroku:** `heroku logs --tail`
- **Railway:** Check logs in Railway dashboard
- **Render:** Check logs in Render dashboard

## 📈 Performance Optimization

For production use, consider:

1. **Database Indexing:** Already implemented in models
2. **Caching:** Add Redis for frequently accessed data
3. **Rate Limiting:** Add express-rate-limit middleware
4. **Compression:** Add compression middleware
5. **Security:** Add helmet.js for security headers

## 🔐 Security Considerations

1. **Environment Variables:** Never commit .env files
2. **CORS:** Configure CORS for specific domains in production
3. **Input Validation:** Already implemented
4. **Authentication:** Add JWT authentication for production use
5. **HTTPS:** Ensure HTTPS is enabled (automatic on most platforms)

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Test MongoDB connection separately
4. Ensure all dependencies are installed

Happy deploying! 🚀