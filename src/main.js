import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../config/db.js';
import userRoutes from '../routes/userRoutes.js';
import jobRoutes from '../routes/jobRoutes.js';
import { Client, Users } from 'node-appwrite';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

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

  if (req.path === "/ping") {
    return res.send("Pong");
  }

  return res.json({
    motto: "Build like a team of hundreds_",
    learn: "https://appwrite.io/docs",
    connect: "https://appwrite.io/discord",
    getInspired: "https://builtwith.appwrite.io",
  });
});

export default app;
