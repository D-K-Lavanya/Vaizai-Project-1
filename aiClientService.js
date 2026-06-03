import axios from 'axios';
import path from 'path';

/**
 * Service to communicate with the Python AI parsing worker
 */
const aiClientService = {
  /**
   * Sends a file path to the Python AI service for NLP parsing
   * @param {string} filePath - Local absolute or relative path to the resume PDF
   * @returns {Promise<Object>} - Structured parsing results
   */
  parseResume: async (filePath) => {
    try {
      // Ensure we pass an absolute path to the Python worker
      const absolutePath = path.resolve(filePath);
      
      console.log(`[AI-Service] Attempting to parse: ${absolutePath}`);

      const response = await axios.post('http://127.0.0.1:8000/api/nlp-parse', {
        filePath: absolutePath
      }, {
        timeout: 15000 // 15 second timeout to prevent hanging the Node runtime
      });

      return response.data;
    } catch (error) {
      // Clean catch block to prevent runtime crashes
      const errorMessage = error.response?.data?.detail || error.message;
      console.error(`[AI-Service] Failed to call Python Worker: ${errorMessage}`);
      
      if (error.code === 'ECONNABORTED') {
        console.error('[AI-Service] Request timed out - Python service is responding too slowly.');
      }
      
      // Return a safe fallback object instead of throwing to keep the Node server alive
      return {
        error: true,
        message: errorMessage,
        fallback: true,
        name: "Extraction Failed",
        skills: []
      };
    }
  }
};

export default aiClientService;
