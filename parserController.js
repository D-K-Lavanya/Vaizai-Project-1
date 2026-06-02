import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

/**
 * Parses a PDF file and extracts text content
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Controller to handle resume parsing requests
 */
const parserController = {
  parseResume: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const text = await extractTextFromPDF(req.file.path);
      
      // Simple algorithm to find contact info or skills (placeholder for more complex AI logic)
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = text.match(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);

      res.status(200).json({
        message: 'Resume parsed successfully',
        extractedText: text,
        metadata: {
          email: emailMatch ? emailMatch[0] : 'Not found',
          phone: phoneMatch ? phoneMatch[0] : 'Not found',
          pageCount: text.length > 0 ? 1 : 0 // pdf-parse provides data.numpages but we are simplifying
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export default parserController;
