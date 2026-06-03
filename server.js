const express = require('express');
const cors = require('cors');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();
const PORT = 5000;

// 1. Enable CORS globally - Critical for allowing React (5173) to talk to Express (5000)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Global Request Logger for Debugging
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Fix for "Cannot GET /" - Provides a clean root status message
app.get('/', (req, res) => {
    res.status(200).send("VaizAI Node.js Backend Gateway is Running Smoothly!");
});

// Register existing resume upload routes (/api/upload)
app.use('/api', resumeRoutes);

// 2. NEW: The exact Jobs route the frontend is looking for to remove that red error banner!
app.get('/api/jobs', (req, res) => {
    res.status(200).json([
        {
            _id: "1",
            title: "Python AI Developer",
            company: "VaizAI Platform",
            location: "Coimbatore (Remote)",
            description: "Building FastAPI and NLP resume parsing pipelines."
        },
        {
            _id: "2",
            title: "Full Stack Software Engineer",
            company: "VaizAI Platform",
            location: "Chennai",
            description: "Managing React frontends and Node.js backend gateways."
        }
    ]);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 3. ADDED: Unified Candidates route for Profile Submission
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Temporary memory store for candidates (replaces DB for the root server)
let candidates = [];

app.get('/api/candidates/job/:jobId/analytics', (req, res) => {
    const { jobId } = req.params;
    
    // Mock job requirements based on the jobId
    const requirements = jobId === "1" 
        ? ["Python", "FastAPI", "NLP", "Machine Learning", "Docker"]
        : ["React", "Node.js", "JavaScript", "TypeScript", "Tailwind"];

    const rankedCandidates = candidates.map(c => {
        const matches = requirements.filter(req => 
            c.skills.some(s => s.toLowerCase().includes(req.toLowerCase())) ||
            (c.resumeText && c.resumeText.toLowerCase().includes(req.toLowerCase()))
        );
        const score = Math.round((matches.length / requirements.length) * 100);
        
        return {
            _id: c.id,
            name: c.name,
            email: c.email,
            matchScore: score,
            matchedSkills: matches,
            status: 'Applied',
            appliedDate: c.createdAt
        };
    });

    rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
        jobTitle: jobId === "1" ? "Python AI Developer" : "Full Stack Software Engineer",
        totalApplicants: rankedCandidates.length,
        averageScore: rankedCandidates.length > 0 ? Math.round(rankedCandidates.reduce((acc, c) => acc + c.matchScore, 0) / rankedCandidates.length) : 0,
        topScore: rankedCandidates.length > 0 ? rankedCandidates[0].matchScore : 0,
        rankings: rankedCandidates
    });
});

app.post('/api/candidates', upload.single('resume'), async (req, res) => {
    try {
        const axios = require('axios');
        const path = require('path');

        if (!req.file) {
            return res.status(400).json({ message: 'No resume file uploaded' });
        }

        const absolutePath = path.resolve(req.file.path);
        console.log(`[Root-Server] Profile submission received. Parsing: ${absolutePath}`);

        // Call the Python AI Worker for advanced NLP parsing
        let aiData = null;
        try {
            const aiResponse = await axios.post('http://127.0.0.1:8000/api/nlp-parse', {
                filePath: absolutePath
            }, { timeout: 10000 });
            aiData = aiResponse.data;
        } catch (aiError) {
            console.warn('[Root-Server] AI Worker call failed, continuing with form data:', aiError.message);
        }

        const newCandidate = {
            id: "res-" + Date.now(),
            name: (aiData && !aiData.fallback) ? aiData.name : req.body.name,
            email: (aiData && !aiData.fallback) ? aiData.email : req.body.email,
            skills: (aiData && !aiData.fallback) ? aiData.skills : (req.body.skills ? req.body.skills.split(',') : []),
            resumeText: aiData ? aiData.raw_text : "", // Hypothetical
            createdAt: new Date()
        };

        candidates.push(newCandidate);

        res.status(201).json({
            message: 'Profile submitted successfully',
            candidateId: newCandidate.id,
            aiProcessed: !!aiData,
            extractedData: newCandidate
        });
    } catch (error) {
        console.error('[Root-Server] Submission Error:', error);
        res.status(500).json({ message: 'Internal server error during submission' });
    }
});

// CATCH-ALL 404 HANDLER
app.use((req, res) => {
    console.log(`[404 ERROR] Route Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        message: `Route ${req.method} ${req.url} not found on this server`,
        debugInfo: "Check the Node.js console for the exact path received."
    });
});

app.listen(PORT, () => {
  console.log(`Server is online and listening on port ${PORT}`);
});