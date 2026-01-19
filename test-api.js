// API Testing Script - Test all endpoints of the Job Board Platform
// This script demonstrates how to use all the API endpoints

const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000';

// Test data
let testData = {
  employer: null,
  job: null,
  candidate: null,
  resume: null,
  application: null
};

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Test functions
async function testServerStatus() {
  console.log('\n🧪 Testing Server Status...');
  const response = await apiRequest('GET', '/');
  console.log('✅ Server is running:', response.message);
  return response;
}

async function testCreateEmployer() {
  console.log('\n🧪 Testing Employer Creation...');
  const employerData = {
    companyName: 'Tech Innovations Inc',
    email: 'hr@techinnovations.com'
  };
  
  const response = await apiRequest('POST', '/employers', employerData);
  testData.employer = response.data;
  console.log('✅ Employer created:', testData.employer.companyName);
  return response;
}

async function testCreateJob() {
  console.log('\n🧪 Testing Job Creation...');
  const jobData = {
    title: 'Senior Software Developer',
    description: 'Build amazing web applications using modern technologies like React, Node.js, and MongoDB. Join our innovative team!',
    location: 'San Francisco, CA',
    salary: 120000,
    employerId: testData.employer.id
  };
  
  const response = await apiRequest('POST', '/jobs', jobData);
  testData.job = response.data;
  console.log('✅ Job created:', testData.job.title);
  return response;
}

async function testGetAllJobs() {
  console.log('\n🧪 Testing Get All Jobs...');
  const response = await apiRequest('GET', '/jobs');
  console.log(`✅ Found ${response.count} jobs`);
  return response;
}

async function testSearchJobs() {
  console.log('\n🧪 Testing Job Search...');
  const response = await apiRequest('GET', '/jobs/search?title=developer&location=san francisco');
  console.log(`✅ Search found ${response.count} matching jobs`);
  return response;
}

async function testCreateCandidate() {
  console.log('\n🧪 Testing Candidate Creation...');
  const candidateData = {
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com'
  };
  
  const response = await apiRequest('POST', '/candidates', candidateData);
  testData.candidate = response.data;
  console.log('✅ Candidate created:', testData.candidate.name);
  return response;
}

async function testCreateResume() {
  console.log('\n🧪 Testing Resume Creation...');
  const resumeData = {
    candidateId: testData.candidate.id,
    fileUrl: 'https://example.com/resumes/alice-johnson-resume.pdf'
  };
  
  const response = await apiRequest('POST', '/resumes', resumeData);
  testData.resume = response.data;
  console.log('✅ Resume created for:', testData.resume.candidate.name);
  return response;
}

async function testSubmitApplication() {
  console.log('\n🧪 Testing Job Application Submission...');
  const applicationData = {
    jobId: testData.job.id,
    candidateId: testData.candidate.id,
    resumeId: testData.resume.id
  };
  
  const response = await apiRequest('POST', '/apply', applicationData);
  testData.application = response.data;
  console.log('✅ Application submitted for job:', testData.application.job.title);
  return response;
}

async function testGetCandidateApplications() {
  console.log('\n🧪 Testing Get Candidate Applications...');
  const response = await apiRequest('GET', `/applications/${testData.candidate.id}`);
  console.log(`✅ Found ${response.count} applications for candidate`);
  return response;
}

async function testUpdateApplicationStatus() {
  console.log('\n🧪 Testing Application Status Update...');
  const updateData = {
    status: 'shortlisted'
  };
  
  const response = await apiRequest('PUT', `/applications/${testData.application.id}`, updateData);
  console.log('✅ Application status updated to:', response.data.status);
  return response;
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Job Board Platform API Tests...');
  console.log('=' .repeat(50));
  
  try {
    // Test all endpoints in order
    await testServerStatus();
    await testCreateEmployer();
    await testCreateJob();
    await testGetAllJobs();
    await testSearchJobs();
    await testCreateCandidate();
    await testCreateResume();
    await testSubmitApplication();
    await testGetCandidateApplications();
    await testUpdateApplicationStatus();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`   Employer: ${testData.employer.companyName}`);
    console.log(`   Job: ${testData.job.title} ($${testData.job.salary.toLocaleString()})`);
    console.log(`   Candidate: ${testData.candidate.name}`);
    console.log(`   Application Status: ${testData.application.status}`);
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running: npm start');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testData,
  apiRequest
};