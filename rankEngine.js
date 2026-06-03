/**
 * Intelligent Ranking Engine for Candidate Resumes
 */

/**
 * Calculates a match score between candidate data and job requirements
 * @param {Object} candidate - Candidate object containing resumeText and skills array
 * @param {Array<string>} targetKeywords - List of skills/keywords from the job posting
 * @returns {Object} - An object containing the score and the match reasoning
 */
export const calculateMatchScore = (candidate, targetKeywords) => {
  const { resumeText, skills: candidateSkills } = candidate;
  
  if (!targetKeywords || targetKeywords.length === 0) {
    return { score: 0, reason: "No job requirements provided" };
  }

  const normalizedTarget = targetKeywords.map(k => k.toLowerCase().trim());
  let matches = new Set();

  // 1. Check structured skills (High confidence)
  if (candidateSkills && Array.isArray(candidateSkills)) {
    candidateSkills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase().trim();
      if (normalizedTarget.includes(normalizedSkill)) {
        matches.add(normalizedSkill);
      }
    });
  }

  // 2. Fallback to raw text matching (Lower confidence)
  if (resumeText) {
    const normalizedText = resumeText.toLowerCase();
    normalizedTarget.forEach(keyword => {
      if (normalizedText.includes(keyword)) {
        matches.add(keyword);
      }
    });
  }

  const matchCount = matches.size;
  const rawScore = (matchCount / normalizedTarget.length) * 100;
  const finalScore = Math.min(Math.round(rawScore), 100);

  return {
    score: finalScore,
    matchedSkills: Array.from(matches),
    reason: `Matched ${matchCount} out of ${normalizedTarget.length} key requirements.`
  };
};

const rankEngine = {
  calculateMatchScore
};

export default rankEngine;
