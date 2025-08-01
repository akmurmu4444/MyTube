import express from 'express';
import Video from '../models/Video.js';
import youtubeService from '../services/youtubeService.js';

const router = express.Router();

// Get all saved videos
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      tags, 
      liked, 
      pinned, 
      sortBy = 'addedAt', 
      sortOrder = 'desc',
      limit = 50,
      page = 1 
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    if (liked === 'true') {
      query.isLiked = true;
    }
    
    if (pinned === 'true') {
      query.isPinned = true;
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // If pinned videos exist, always show them first
    if (pinned !== 'false') {
      sortConfig.isPinned = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const videos = await Video.find(query)
      .sort(sortConfig)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get videos error:', error.message);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Save video from YouTube
router.post('/', async (req, res) => {
  try {
    const { youtubeId, tags = [] } = req.body;
    
    if (!youtubeId) {
      return res.status(400).json({ error: 'YouTube video ID is required' });
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ youtubeId });
    if (existingVideo) {
      return res.status(409).json({ 
        error: 'Video already saved',
        data: existingVideo 
      });
    }

    // Get video details from YouTube API
    const videoDetails = await youtubeService.getVideoDetails(youtubeId);
    
    // Create new video document
    const video = new Video({
      ...videoDetails,
      tags: Array.isArray(tags) ? tags : []
    });

    await video.save();

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video saved successfully'
    });
  } catch (error) {
    console.error('Save video error:', error.message);
    res.status(500).json({ 
      error: 'Failed to save video',
      message: error.message 
    });
  }
});

// Update video
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.youtubeId;
    delete updates.addedAt;
    delete updates._id;

    const video = await Video.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      success: true,
      data: video,
      message: 'Video updated successfully'
    });
  } catch (error) {
    console.error('Update video error:', error.message);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndDelete(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error.message);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Get video by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Get video error:', error.message);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Toggle like status
router.patch('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.isLiked = !video.isLiked;
    await video.save();

    res.json({
      success: true,
      data: video,
      message: `Video ${video.isLiked ? 'liked' : 'unliked'} successfully`
    });
  } catch (error) {
    console.error('Toggle like error:', error.message);
    res.status(500).json({ error: 'Failed to toggle like status' });
  }
});

// Toggle pin status
router.patch('/:id/pin', async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.isPinned = !video.isPinned;
    await video.save();

    res.json({
      success: true,
      data: video,
      message: `Video ${video.isPinned ? 'pinned' : 'unpinned'} successfully`
    });
  } catch (error) {
    console.error('Toggle pin error:', error.message);
    res.status(500).json({ error: 'Failed to toggle pin status' });
  }
});

export default router;