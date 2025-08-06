import express from 'express';
import Video from '../models/Video.js';
import UserVideo from '../models/UserVideo.js';
import youtubeService from '../services/youtubeService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all saved videos
router.get('/', optionalAuth, async (req, res) => {
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

    // If user is authenticated, get their videos
    if (req.user) {
      // Build query for user's videos
      let query = { addedBy: req.user._id };
      
      if (search) {
        query.$text = { $search: search };
      }
      
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        query.tags = { $in: tagArray };
      }

      // Sort configuration
      const sortConfig = {};
      sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const videos = await Video.find(query)
        .sort(sortConfig)
        .limit(parseInt(limit))
        .skip(skip)
        .populate('addedBy', 'name email');

      // Get user-specific data for these videos
      const videoIds = videos.map(v => v._id);
      const userVideos = await UserVideo.find({
        userId: req.user._id,
        videoId: { $in: videoIds }
      });

      // Create a map for quick lookup
      const userVideoMap = {};
      userVideos.forEach(uv => {
        userVideoMap[uv.videoId.toString()] = uv;
      });

      // Merge video data with user-specific data
      const videosWithUserData = videos.map(video => {
        const userVideo = userVideoMap[video._id.toString()];
        return {
          ...video.toObject(),
          isLiked: userVideo?.isLiked || false,
          isPinned: userVideo?.isPinned || false,
          isInWatchlist: userVideo?.isInWatchlist || false,
          watchCount: userVideo?.watchCount || 0,
          lastWatchedAt: userVideo?.lastWatchedAt
        };
      });

      const total = await Video.countDocuments(query);

      return res.json({
        success: true,
        data: videosWithUserData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }

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
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { youtubeId, tags = [] } = req.body;
    
    if (!youtubeId) {
      return res.status(400).json({ error: 'YouTube video ID is required' });
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ 
      youtubeId,
      addedBy: req.user._id 
    });
    
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
      addedBy: req.user._id,
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
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log('Update video:', updates);

    // Remove fields that shouldn't be updated directly
    delete updates.youtubeId;
    delete updates.addedAt;
    delete updates._id;

    const video = await Video.findByIdAndUpdate(
      { _id: id, addedBy: req.user._id }, 
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOneAndDelete({
      _id: id,
      addedBy: req.user._id
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Also delete user-video relationships
    await UserVideo.deleteMany({ videoId: id });

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
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = { _id: id };
    if (req.user) {
      query.addedBy = req.user._id;
    }
    
    const video = await Video.findOne(query).populate('addedBy', 'name email');
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get user-specific data if authenticated
    let videoWithUserData = video.toObject();
    
    if (req.user) {
      const userVideo = await UserVideo.findOne({
        userId: req.user._id,
        videoId: video._id
      });

      videoWithUserData = {
        ...videoWithUserData,
        isLiked: userVideo?.isLiked || false,
        isPinned: userVideo?.isPinned || false,
        isInWatchlist: userVideo?.isInWatchlist || false,
        watchCount: userVideo?.watchCount || 0,
        lastWatchedAt: userVideo?.lastWatchedAt
      };
    }

    res.json({
      success: true,
      data: videoWithUserData
    });
  } catch (error) {
    console.error('Get video error:', error.message);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Toggle like status
router.patch('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findOne({
      _id: id,
      addedBy: req.user._id
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Find or create user-video relationship
    let userVideo = await UserVideo.findOne({
      userId: req.user._id,
      videoId: video._id
    });

    if (!userVideo) {
      userVideo = new UserVideo({
        userId: req.user._id,
        videoId: video._id
      });
    }

    userVideo.isLiked = !userVideo.isLiked;
    userVideo.likedAt = userVideo.isLiked ? new Date() : null;
    await userVideo.save();

    res.json({
      success: true,
      data: {
        ...video.toObject(),
        isLiked: userVideo.isLiked,
        isPinned: userVideo.isPinned,
        isInWatchlist: userVideo.isInWatchlist
      },
      message: `Video ${userVideo.isLiked ? 'liked' : 'unliked'} successfully`
    });
  } catch (error) {
    console.error('Toggle like error:', error.message);
    res.status(500).json({ error: 'Failed to toggle like status' });
  }
});

// Toggle pin status
router.patch('/:id/pin', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findOne({
      _id: id,
      addedBy: req.user._id
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Find or create user-video relationship
    let userVideo = await UserVideo.findOne({
      userId: req.user._id,
      videoId: video._id
    });

    if (!userVideo) {
      userVideo = new UserVideo({
        userId: req.user._id,
        videoId: video._id
      });
    }

    userVideo.isPinned = !userVideo.isPinned;
    userVideo.pinnedAt = userVideo.isPinned ? new Date() : null;
    await userVideo.save();

    res.json({
      success: true,
      data: {
        ...video.toObject(),
        isLiked: userVideo.isLiked,
        isPinned: userVideo.isPinned,
        isInWatchlist: userVideo.isInWatchlist
      },
      message: `Video ${userVideo.isPinned ? 'pinned' : 'unpinned'} successfully`
    });
  } catch (error) {
    console.error('Toggle pin error:', error.message);
    res.status(500).json({ error: 'Failed to toggle pin status' });
  }
});

// Toggle watchlist status
router.patch('/:id/watchlist', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findOne({
      _id: id,
      addedBy: req.user._id
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Find or create user-video relationship
    let userVideo = await UserVideo.findOne({
      userId: req.user._id,
      videoId: video._id
    });

    if (!userVideo) {
      userVideo = new UserVideo({
        userId: req.user._id,
        videoId: video._id
      });
    }

    userVideo.isInWatchlist = !userVideo.isInWatchlist;
    userVideo.addedToWatchlistAt = userVideo.isInWatchlist ? new Date() : null;
    await userVideo.save();

    res.json({
      success: true,
      data: {
        ...video.toObject(),
        isLiked: userVideo.isLiked,
        isPinned: userVideo.isPinned,
        isInWatchlist: userVideo.isInWatchlist
      },
      message: `Video ${userVideo.isInWatchlist ? 'added to' : 'removed from'} watchlist successfully`
    });
  } catch (error) {
    console.error('Toggle watchlist error:', error.message);
    res.status(500).json({ error: 'Failed to toggle watchlist status' });
  }
});

export default router;