import mongoose from 'mongoose';

// Junction table for user-video relationships
const userVideoSchema = new mongoose.Schema({
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
  
  // User-specific video data
  isLiked: {
    type: Boolean,
    default: false
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  isInWatchlist: {
    type: Boolean,
    default: false
  },
  
  // Watch tracking
  watchCount: {
    type: Number,
    default: 0
  },
  
  lastWatchedAt: {
    type: Date
  },
  
  // Timestamps
  likedAt: {
    type: Date
  },
  
  pinnedAt: {
    type: Date
  },
  
  addedToWatchlistAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes
userVideoSchema.index({ userId: 1, videoId: 1 }, { unique: true });
userVideoSchema.index({ userId: 1, isLiked: 1 });
userVideoSchema.index({ userId: 1, isPinned: 1 });
userVideoSchema.index({ userId: 1, isInWatchlist: 1 });
userVideoSchema.index({ userId: 1, lastWatchedAt: -1 });

export default mongoose.model('UserVideo', userVideoSchema);