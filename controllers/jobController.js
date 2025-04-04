const Job = require('../models/jobModel'); // Job model
const User = require('../models/userModel'); // User model

const asyncHandler = require('express-async-handler');

// Create a new job
const createJob = asyncHandler(async (req, res) => {
    const { title, company, location, type, salary, description, requirements, benefits, contactPerson, startDate, status } = req.body;

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
        postedBy: "67eea6fe1ffeb01947abe181" // assuming the user is authenticated
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
});

// Get all jobs
const getAllJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
});

// Get a job by ID
const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
    }

    res.json(job);
});

// Update a job
const updateJobById = asyncHandler(async (req, res) => {
    const { title, company, location, type, salary, description, requirements, benefits, contactPerson, startDate, status } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
    }

    job.title = title || job.title;
    job.company = company || job.company;
    job.location = location || job.location;
    job.type = type || job.type;
    job.salary = salary || job.salary;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.benefits = benefits || job.benefits;
    job.contactPerson = contactPerson || job.contactPerson;
    job.startDate = startDate || job.startDate;
    job.status = status || job.status;

    const updatedJob = await job.save();
    res.json(updatedJob);
});

// Delete a job
const deleteJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
    }

    await job.remove();
    res.json({ message: 'Job removed' });
});

// 🟢 Apply for a Job (User requests to apply)
const applyForJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;  // Job ID from request params
    const { userId } = req.body;   // User ID from request body

    // Fetch Job
    const job = await Job.findById(jobId);
    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    // Fetch User
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already applied
    if (job.pendingApplications.some(applicant => applicant._id.equals(user._id)) ||
        job.acceptedApplications.some(applicant => applicant._id.equals(user._id))) {
        return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add full user details to pendingApplications
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

    res.status(200).json({ message: 'Application submitted for review', job });
});


// 🟢 Get all job applications (for supervisors)
const getJobApplications = asyncHandler(async (req, res) => {
    const { jobId } = req.params; // Get Job ID

    const job = await Job.findById(jobId)
        .populate({
            path: 'pendingApplications',
            select: 'name email skills documents certifications createdAt updatedAt'
        })
        .populate({
            path: 'acceptedApplications',
            select: 'name email skills documents certifications createdAt updatedAt'
        });

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
        pendingApplications: job.pendingApplications,
        acceptedApplications: job.acceptedApplications
    });
});
;


// ✅ Accept or Reject a Job Application (Supervisor Decision)
const handleJobApplication = asyncHandler(async (req, res) => {
    const { jobId, userId } = req.params; // Get job ID & user ID from request params
    const { action } = req.body; // "accept" or "reject"

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if user applied
    if (!job.pendingApplications.includes(userId)) {
        return res.status(400).json({ message: 'User has not applied for this job' });
    }

    if (action === 'accept') {
        // Move user from pending to accepted
        job.pendingApplications = job.pendingApplications.filter(id => id.toString() !== userId);
        job.acceptedApplications.push(userId);
        await job.save();

        res.status(200).json({ message: 'Application accepted' });
    } else if (action === 'reject') {
        // Remove user from pending applications
        job.pendingApplications = job.pendingApplications.filter(id => id.toString() !== userId);
        await job.save();

        res.status(200).json({ message: 'Application rejected' });
    } else {
        res.status(400).json({ message: 'Invalid action' });
    }
});

module.exports = {
    createJob, getAllJobs, getJobById, updateJobById, deleteJobById, applyForJob,
    getJobApplications,
    handleJobApplication
};
