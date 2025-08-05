import express from 'express';
import Note from '../models/Note.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all notes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { videoId, search } = req.query;
    
    let query = { userId: req.user._id };
    
    if (videoId) {
      query.videoId = videoId;
    }
    
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const notes = await Note.find(query)
      .populate('videoId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Get notes error:', error.message);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { videoId, content, timestamp } = req.body;
    
    if (!videoId || !content) {
      return res.status(400).json({ error: 'Video ID and content are required' });
    }

    const note = new Note({
      userId: req.user._id,
      videoId,
      content,
      timestamp
    });

    await note.save();
    await note.populate('videoId');

    res.status(201).json({
      success: true,
      data: note,
      message: 'Note created successfully'
    });
  } catch (error) {
    console.error('Create note error:', error.message);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, timestamp } = req.body;

    const note = await Note.findByIdAndUpdate(
      { _id: id, userId: req.user._id },
      { content, timestamp },
      { new: true, runValidators: true }
    ).populate('videoId');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      data: note,
      message: 'Note updated successfully'
    });
  } catch (error) {
    console.error('Update note error:', error.message);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error.message);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get notes with video details (for My Notes page)
router.get('/with-videos', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    
    let query = { userId: req.user._id };
    
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notes = await Note.find(query)
      .populate({
        path: 'videoId',
        select: 'title thumbnail youtubeId channelTitle duration'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      data: notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notes with videos error:', error.message);
    res.status(500).json({ error: 'Failed to fetch notes with videos' });
  }
});

export default router;