import express from 'express';
import Candidate from '../models/Candidate.js';
import upload from '../middleware/upload.js';
import { extractTextFromPDF } from '../controllers/parserController.js';
import { sendApplicationConfirmation } from '../utils/emailService.js';

const router = express.Router();

/**
 * @route POST /api/candidate-portal/submit
 * @desc Explicitly handle candidate profile submissions from the portal
 */
router.post('/submit', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, skills, experience, education } = req.body;
    
    let parsedSkills = skills;
    if (typeof skills === 'string') {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(',').map(s => s.trim());
      }
    }

    let resumeText = '';
    if (req.file) {
      try {
        resumeText = await extractTextFromPDF(req.file.path);
      } catch (parseError) {
        console.warn('PDF parsing failed, using fallback:', parseError.message);
        resumeText = 'Fallback: Scanned or raw unparseable resume text context.';
      }
    }

    const newCandidate = new Candidate({
      name,
      email,
      phone,
      skills: parsedSkills || [],
      experience,
      education,
      resumeUrl: req.file ? req.file.path : null,
      resumeText: resumeText,
      submittedAt: new Date()
    });

    const savedCandidate = await newCandidate.save();

    // Trigger confirmation email
    try {
      await sendApplicationConfirmation(email, name, 'Software Engineer (Portal Submission)');
    } catch (emailError) {
      console.error('Portal submission email failed:', emailError);
    }

    res.status(201).json({
      message: 'Profile submitted successfully',
      candidateId: savedCandidate._id
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
