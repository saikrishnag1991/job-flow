import { Client, Users } from 'node-appwrite';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../config/db'; // Assuming a separate DB connection for your app
import userRoutes from '../routes/userRoutes';  // Custom routes for users
import jobRoutes from '../routes/jobRoutes';    // Custom routes for jobs
import serverless from 'serverless-http';  // Serverless HTTP wrapper

dotenv.config();
connectDB();  // Initialize DB connection (if necessary for Express routes)

const app = express();
app.use(express.json());

// ✅ Enable CORS for all origins
app.use(cors());

// Setup your custom API routes for users and jobs
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

// Appwrite function part
app.post('/appwrite-function', async (req, res) => {
  // Appwrite client setup
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);

  try {
    const response = await users.list();
    console.log(`Total users: ${response.total}`);
  } catch (err) {
    console.error('Could not list users: ' + err.message);
    return res.status(500).send('Error listing users');
  }

  // Check if the request path is "/ping"
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

// Wrap the Express app in serverless-http for serverless environments
module.exports.handler = serverless(app);  // Export the handler for serverless environment
