import express from 'express';
import Interview from '../models/Interview.js';

const router = express.Router();

/**
 * @route POST /api/interviews
 * @desc Schedule a new interview session
 */
router.post('/', async (req, res) => {
  try {
    const interview = new Interview(req.body);
    const savedInterview = await interview.save();
    res.status(201).json(savedInterview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route GET /api/interviews/candidate/:candidateId
 * @desc Fetch all interview slots for a specific candidate
 */
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.params.candidateId })
      .sort({ scheduledAt: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PATCH /api/interviews/:id/room
 * @desc Update the meeting room link or token for an interview
 */
router.patch('/:id/room', async (req, res) => {
  try {
    const { roomLink } = req.body;
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { roomLink },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route GET /api/interviews
 * @desc Get all interviews (Recruiter view)
 */
router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('candidate', 'name email')
      .sort({ scheduledAt: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
