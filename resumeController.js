/**
 * Handles the resume upload request.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const axios = require('axios');
    const path = require('path');
    const fs = require('fs');

    const filePath = path.resolve(req.file.path);

    const nlpServiceUrl = 'http://127.0.0.1:8000/api/nlp-parse';
    
    // Send the file path to the Python NLP engine for parsing
    const response = await axios.post(nlpServiceUrl, {
      filePath: filePath
    }).catch(err => {
      if (err.code === 'ECONNREFUSED') {
        throw new Error(`AI Service connection failed at ${nlpServiceUrl}. Is the FastAPI server running?`);
      }
      throw err;
    });

    res.status(200).json({
      message: 'File uploaded and parsed successfully',
      file: req.file,
      aiData: response.data
    });
  } catch (error) {
    console.error('Error in resume upload/parse pipeline:', error.message);
    res.status(500).json({
      message: 'Failed to process resume',
      error: error.message
    });
  }
};

module.exports = {
  uploadResume
};
