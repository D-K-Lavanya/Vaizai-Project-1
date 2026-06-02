import express from 'express';
import Assessment from '../models/Assessment.js';

const router = express.Router();

/**
 * @route POST /api/assessments
 * @desc Create a new coding challenge
 */
router.post('/', async (req, res) => {
  try {
    const assessment = new Assessment(req.body);
    const savedAssessment = await assessment.save();
    res.status(201).json(savedAssessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route GET /api/assessments
 * @desc Get all available coding challenges
 */
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find();
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/assessments/:id
 * @desc Get a specific challenge by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/assessments/:id/submit
 * @desc Submit a solution for a challenge and get scoring metrics
 * (Note: Real code execution would require a sandbox environment)
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const { code, candidateId } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    // Placeholder for actual code execution and validation
    // In a real scenario, we would run the code against assessment.testCases
    
    const results = {
      score: 85, // Dummy score
      passed: true,
      metrics: {
        runtime: '45ms',
        memory: '12MB',
        testCasesPassed: 4,
        totalTestCases: 5
      },
      submittedAt: new Date()
    };

    res.json({
      message: 'Submission processed successfully',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
