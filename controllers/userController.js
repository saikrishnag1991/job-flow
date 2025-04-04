import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Register User
export const registerUser = asyncHandler(async (req, res) => {
    const {
        name, email, password, phone, address,
        jobTitle, experience, skills, certifications, documents, settings
    } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        phone,
        address,
        jobTitle,
        experience,
        skills,
        certifications,
        documents,
        settings
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            jobTitle: user.jobTitle,
            experience: user.experience,
            skills: user.skills,
            certifications: user.certifications,
            documents: user.documents,
            settings: user.settings
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            user,
            token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const users = await User.find().skip(skip).limit(limit);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User by ID
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Update User by ID
export const updateUserById = asyncHandler(async (req, res) => {
    const {
        name, email, password, phone, address,
        jobTitle, experience, skills, certifications, documents, settings
    } = req.body;

    const user = await User.findById(req.params.id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.jobTitle = jobTitle || user.jobTitle;
        user.experience = experience || user.experience;
        user.skills = skills || user.skills;
        user.certifications = certifications || user.certifications;
        user.documents = documents || user.documents;
        user.settings = settings || user.settings;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            jobTitle: updatedUser.jobTitle,
            experience: updatedUser.experience,
            skills: updatedUser.skills,
            certifications: updatedUser.certifications,
            documents: updatedUser.documents,
            settings: updatedUser.settings
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});
