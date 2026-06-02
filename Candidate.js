import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
  matchScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Assessment', 'Interview', 'Rejected'],
    default: 'Applied',
  },
  resumeUrl: {
    type: String,
  },
  resumeText: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Candidate', candidateSchema);
