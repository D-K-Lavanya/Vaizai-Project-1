import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  instructions: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  testCases: [testCaseSchema],
  starterCode: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'javascript',
  },
  timeLimit: {
    type: Number, // in seconds
    default: 30,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Assessment', assessmentSchema);
