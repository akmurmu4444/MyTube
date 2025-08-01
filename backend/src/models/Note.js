import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  timestamp: {
    type: Number, // seconds
    min: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
noteSchema.index({ videoId: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);