/**
 * Intelligent Ranking Engine for Candidate Resumes
 * Provides scoring algorithms based on keyword matching and text analysis
 */

/**
 * Calculates a match score between a resume text and a set of required skills/keywords
 * @param {string} resumeText - Raw text extracted from the candidate's resume
 * @param {Array<string>} targetKeywords - List of skills or keywords to match against
 * @returns {number} - A score from 0 to 100
 */
export const calculateMatchScore = (resumeText, targetKeywords) => {
  if (!resumeText || !targetKeywords || targetKeywords.length === 0) {
    return 0;
  }

  const normalizedText = resumeText.toLowerCase();
  let matches = 0;

  targetKeywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (normalizedKeyword && normalizedText.includes(normalizedKeyword)) {
      matches++;
      
      // Bonus for multiple occurrences (simplified)
      const occurrences = (normalizedText.match(new RegExp(normalizedKeyword, 'g')) || []).length;
      if (occurrences > 2) {
        matches += 0.5; // Small bonus for high relevance
      }
    }
  });

  // Calculate percentage based on target keywords
  const rawScore = (matches / targetKeywords.length) * 100;
  
  // Cap at 100
  return Math.min(Math.round(rawScore), 100);
};

/**
 * Compares two sets of skills (arrays) and returns an overlap coefficient
 * @param {Array<string>} candidateSkills 
 * @param {Array<string>} requiredSkills 
 * @returns {number} - Overlap score (0 to 1)
 */
export const calculateSkillOverlap = (candidateSkills, requiredSkills) => {
  if (!candidateSkills.length || !requiredSkills.length) return 0;
  
  const setA = new Set(candidateSkills.map(s => s.toLowerCase().trim()));
  const setB = new Set(requiredSkills.map(s => s.toLowerCase().trim()));
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  
  return intersection.size / Math.min(setA.size, setB.size);
};

const rankEngine = {
  calculateMatchScore,
  calculateSkillOverlap
};

export default rankEngine;
