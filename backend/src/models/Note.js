import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
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
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ videoId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, videoId: 1 });

export default mongoose.model('Note', noteSchema);