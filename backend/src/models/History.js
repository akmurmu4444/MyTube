import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  
  watchedAt: {
    type: Date,
    default: Date.now
  },
  
  duration: {
    type: Number, // seconds watched
    required: true,
    min: 0
  },
  
  position: {
    type: Number, // last position in seconds
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
historySchema.index({ videoId: 1, watchedAt: -1 });
historySchema.index({ watchedAt: -1 });

export default mongoose.model('History', historySchema);