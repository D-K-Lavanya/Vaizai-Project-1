const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadResume } = require('../controllers/resumeController');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

/**
 * Route: POST /upload
 * Full Path: /api/upload (when mounted in server.js)
 */
router.post('/upload', upload.single('resume'), uploadResume);

module.exports = router;
