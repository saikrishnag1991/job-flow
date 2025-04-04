import Job from '../models/jobModel.js'; // Job model
import User from '../models/userModel.js'; // User model
import asyncHandler from 'express-async-handler';

// Create a new job
export const createJob = asyncHandler(async (req, res) => {
    const {
        title, company, location, type, salary,
        description, requirements, benefits, contactPerson,
        startDate, status
    } = req.body;

    const job = new Job({
        title,
        company,
        location,
        type,
        salary,
        description,
        requirements,
        benefits,
        contactPerson,
        startDate,
        status,
        postedBy: "67eea6fe1ffeb01947abe181" // Mock user ID or get from auth
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
});

// Get all jobs
export const getAllJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
});

// Get a job by ID
export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
});

// Update a job
export const updateJobById = asyncHandler(async (req, res) => {
    const {
        title, company, location, type, salary,
        description, requirements, benefits, contactPerson,
        startDate, status
    } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    Object.assign(job, {
        title, company, location, type, salary,
        description, requirements, benefits, contactPerson,
        startDate, status
    });

    const updatedJob = await job.save();
    res.json(updatedJob);
});

// Delete a job
export const deleteJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    await job.remove();
    res.json({ message: 'Job removed' });
});

// Apply for a Job
export const applyForJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { userId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyApplied = job.pendingApplications.some(app => app._id.equals(user._id)) ||
        job.acceptedApplications.some(app => app._id.equals(user._id));

    if (alreadyApplied) {
        return res.status(400).json({ message: 'Already applied' });
    }

    job.pendingApplications.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        jobTitle: user.jobTitle,
        experience: user.experience,
        skills: user.skills,
        certifications: user.certifications,
        documents: user.documents
    });

    await job.save();
    res.status(200).json({ message: 'Application submitted', job });
});

// Get job applications
export const getJobApplications = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
        .populate({
            path: 'pendingApplications',
            select: 'name email skills documents certifications createdAt updatedAt'
        })
        .populate({
            path: 'acceptedApplications',
            select: 'name email skills documents certifications createdAt updatedAt'
        });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.status(200).json({
        pendingApplications: job.pendingApplications,
        acceptedApplications: job.acceptedApplications
    });
});

// Accept or Reject an application
export const handleJobApplication = asyncHandler(async (req, res) => {
    const { jobId, userId } = req.params;
    const { action } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!job.pendingApplications.find(app => app._id?.toString() === userId)) {
        return res.status(400).json({ message: 'User has not applied' });
    }

    if (action === 'accept') {
        job.pendingApplications = job.pendingApplications.filter(app => app._id?.toString() !== userId);
        job.acceptedApplications.push(userId);
        await job.save();
        res.status(200).json({ message: 'Application accepted' });
    } else if (action === 'reject') {
        job.pendingApplications = job.pendingApplications.filter(app => app._id?.toString() !== userId);
        await job.save();
        res.status(200).json({ message: 'Application rejected' });
    } else {
        res.status(400).json({ message: 'Invalid action' });
    }
});
