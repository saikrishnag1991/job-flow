const { Client, Users } = require('node-appwrite');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const connectDB = require('../config/db'); // Adjust path based on your structure
const userRoutes = require('../routes/userRoutes'); // Adjust path based on your structure
const jobRoutes = require('../routes/jobRoutes'); // Adjust path based on your structure

dotenv.config();

// Initialize DB connection if needed
connectDB();

const app = express();
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Setup custom API routes for users and jobs
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

// Appwrite function part
app.post('/appwrite-function', async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] || '');

  const users = new Users(client);

  try {
    const response = await users.list();
    console.log(`Total users: ${response.total}`);
  } catch (err) {
    console.error('Could not list users: ' + err.message);
    return res.status(500).send('Error listing users');
  }

  // Handle "/ping" endpoint
  if (req.path === "/ping") {
    return res.send("Pong");
  }

  // Default response from the Appwrite function
  return res.json({
    motto: "Build like a team of hundreds_",
    learn: "https://appwrite.io/docs",
    connect: "https://appwrite.io/discord",
    getInspired: "https://builtwith.appwrite.io",
  });
});

// Appwrite will invoke the function automatically when triggered
module.exports = app;  // Export the app as the handler for Appwrite
