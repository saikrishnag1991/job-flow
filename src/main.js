import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../config/db.js';
import userRoutes from '../routes/userRoutes.js';
import jobRoutes from '../routes/jobRoutes.js';
import { Client, Users } from 'node-appwrite';
import serverless from 'serverless-http'; // Import serverless-http

dotenv.config();  // Load environment variables from .env file
connectDB();  // Connect to the database

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

// Appwrite Function Route Example
app.post('/appwrite-function', async (req, res) => {
  // Initialize the Appwrite client
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT) // Appwrite API endpoint
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)   // Appwrite project ID
    .setKey(process.env.APPWRITE_API_KEY);                   // Appwrite API key from environment variable

  // Debugging log
  console.log("Appwrite Client Initialized", client);

  const users = new Users(client);  // Create a new Users instance

  try {
    const response = await users.list();  // Fetch list of users
    console.log(`Total users: ${response.total}`);  // Log the total users
  } catch (err) {
    console.error('Could not list users: ' + err.message);  // Log the error if fetching fails
    return res.status(500).send('Error listing users');  // Send error response
  }

  // Ping endpoint (for testing)
  if (req.path === "/ping") {
    return res.send("Pong");
  }

  // Respond with a simple JSON message if no issues
  return res.json({
    motto: "Build like a team of hundreds_",
    learn: "https://appwrite.io/docs",
    connect: "https://appwrite.io/discord",
    getInspired: "https://builtwith.appwrite.io",
  });
});

// Global error handler (catch unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);  // Log the error stack
  res.status(500).send('Something broke!');  // Send generic error message
});

// Exporting for serverless deployment
export default serverless(app);  // ES module export

