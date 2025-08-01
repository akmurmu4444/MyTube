import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Tag', tagSchema);