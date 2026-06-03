import express from 'express';
import Job from '../models/Job.js';
import roleCheck from '../../api-gateway/src/middlewares/roleCheck.mjs';

const router = express.Router();

// POST a new job - ONLY accessible by recruiters
router.post('/', roleCheck(['recruiter']), async (req, res) => {
  try {
    const { title, company, description, requirements, location } = req.body;
    const newJob = new Job({
      title,
      company,
      description,
      requirements,
      location,
    });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
