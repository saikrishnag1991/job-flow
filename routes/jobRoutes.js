const express = require('express');
const { createJob, getAllJobs, getJobById, updateJobById, deleteJobById, applyForJob, getJobApplications, handleJobApplication } = require('../controllers/jobController'); // Make sure this import path is correct
const router = express.Router();

// Routes for jobs
router.route('/').post(createJob).get(getAllJobs); // Create and Get all jobs
router.route('/:id').get(getJobById).put(updateJobById).delete(deleteJobById); // Get, Update, Delete job by ID
router.post('/:jobId/apply', applyForJob);

// Get job applications (Supervisor)
router.get('/:jobId/applications', getJobApplications);

// Accept or Reject job application (Supervisor)
router.put('/:jobId/applications/:userId', handleJobApplication);

module.exports = router;
