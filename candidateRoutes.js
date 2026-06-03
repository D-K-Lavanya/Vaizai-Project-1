import express from 'express';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import upload from '../middleware/upload.js';
import { calculateMatchScore } from '../utils/rankEngine.js';
import { sendStatusUpdate } from '../utils/emailService.js';
import roleCheck from '../../api-gateway/src/middlewares/roleCheck.mjs';
import { extractTextFromPDF } from '../controllers/parserController.js';
import aiClientService from '../services/aiClientService.js';

const router = express.Router();

/**
 * @route PATCH /api/candidates/:id/status
 * @desc Update candidate status and send email notification
 */
router.patch('/:id/status', roleCheck(['recruiter']), async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Send email notification
    await sendStatusUpdate(candidate.email, candidate.name, status);

    res.json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route GET /api/candidates/job/:jobId/analytics
 * @desc Get sorted matching score analytics for a specific job
 */
router.get('/job/:jobId/analytics', roleCheck(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Extract keywords from job title and requirements
    const targetKeywords = [...job.requirements, ...job.title.split(' ')];
    
    const candidates = await Candidate.find();

    const rankedCandidates = candidates.map(candidate => {
      const matchData = calculateMatchScore(candidate, targetKeywords);
      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        matchScore: matchData.score,
        matchedSkills: matchData.matchedSkills,
        status: candidate.status,
        appliedDate: candidate.createdAt
      };
    });

    // Sort descending by match score
    rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    // Add summary analytics
    const analytics = {
      jobTitle: job.title,
      totalApplicants: rankedCandidates.length,
      averageScore: rankedCandidates.length > 0 
        ? Math.round(rankedCandidates.reduce((acc, curr) => acc + curr.matchScore, 0) / rankedCandidates.length) 
        : 0,
      topScore: rankedCandidates.length > 0 ? rankedCandidates[0].matchScore : 0,
      rankings: rankedCandidates
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/candidates/job/:jobId/rankings
 * @desc Get ranked candidates for a specific job based on match score
 */
router.get('/job/:jobId/rankings', roleCheck(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // 1. Fetch the job to get keywords
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Combine requirements and title for keywords
    const keywords = [...job.requirements, job.title];
    
    // 2. Fetch all candidates
    const candidates = await Candidate.find();

    // 3. Calculate scores and map
    const rankedCandidates = candidates.map(candidate => {
      const score = calculateMatchScore(candidate.resumeText || '', keywords);
      return {
        ...candidate.toObject(),
        matchScore: score
      };
    });

    // 4. Sort by score descending
    rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json(rankedCandidates);
  } catch (error) {
    console.error('Ranking error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST a new candidate with resume upload
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, skills } = req.body;
    
    // skills might come as a string or array depending on how it's sent
    let parsedSkills = skills;
    if (typeof skills === 'string') {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(',').map(s => s.trim());
      }
    }

    let resumeText = '';
    let aiParsedData = null;

    if (req.file) {
      // 1. Get raw text for keyword matching/ranking engine
      try {
        resumeText = await extractTextFromPDF(req.file.path);
      } catch (parseError) {
        console.warn('Local PDF extraction failed:', parseError.message);
        resumeText = 'Fallback: Text extraction failed.';
      }

      // 2. Call Python AI Worker for advanced NLP parsing
      aiParsedData = await aiClientService.parseResume(req.file.path);
    }

    // Use AI data if available, otherwise fall back to form data
    const finalCandidateData = {
      name: (aiParsedData && !aiParsedData.fallback) ? aiParsedData.name : name,
      email: (aiParsedData && !aiParsedData.fallback) ? aiParsedData.email : email,
      phone: (aiParsedData && !aiParsedData.fallback) ? aiParsedData.phone : phone,
      skills: (aiParsedData && !aiParsedData.fallback) ? aiParsedData.skills : (parsedSkills || []),
      resumeUrl: req.file ? req.file.path : null,
      resumeText: resumeText
    };

    const newCandidate = new Candidate({
      ...finalCandidateData,
      status: 'Applied'
    });

    const savedCandidate = await newCandidate.save();
    res.status(201).json({
      message: 'Profile submitted successfully',
      candidateId: savedCandidate._id,
      aiProcessed: aiParsedData && !aiParsedData.fallback
    });
  } catch (error) {
    console.error('Candidate creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET all candidates
router.get('/', roleCheck(['recruiter']), async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
