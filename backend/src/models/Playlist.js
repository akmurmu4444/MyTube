import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  videoIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
playlistSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('Playlist', playlistSchema);