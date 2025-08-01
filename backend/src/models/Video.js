import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  // YouTube video ID (unique identifier)
  youtubeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic video metadata from YouTube API
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  thumbnail: {
    type: String,
    required: true
  },
  
  duration: {
    type: String, // ISO 8601 duration format (PT4M13S)
    required: true
  },
  
  publishedAt: {
    type: Date,
    required: true
  },
  
  channelTitle: {
    type: String,
    required: true
  },
  
  // Personal metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  isLiked: {
    type: Boolean,
    default: false
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Tracking
  addedAt: {
    type: Date,
    default: Date.now
  },
  
  watchCount: {
    type: Number,
    default: 0
  },
  
  lastWatchedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ tags: 1 });
videoSchema.index({ isLiked: 1 });
videoSchema.index({ isPinned: 1 });
videoSchema.index({ addedAt: -1 });
videoSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Video', videoSchema);