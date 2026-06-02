import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  recruiterName: {
    type: String,
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    default: 45, // Duration in minutes
  },
  roomLink: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Technical', 'HR', 'Cultural', 'Final'],
    default: 'Technical',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Interview', interviewSchema);
