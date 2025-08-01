import express from 'express';
import youtubeService from '../services/youtubeService.js';

const router = express.Router();

// Search YouTube videos
router.get('/search', async (req, res) => {
  try {
    const { q: query, maxResults = 25 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const videos = await youtubeService.searchVideos(query, parseInt(maxResults));
    
    res.json({
      success: true,
      data: videos,
      count: videos.length
    });
  } catch (error) {
    console.error('YouTube search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search YouTube videos',
      message: error.message 
    });
  }
});

// Get video details by YouTube ID
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const video = await youtubeService.getVideoDetails(videoId);
    
    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('YouTube video details error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get video details',
      message: error.message 
    });
  }
});

// Search by tags/topics
router.post('/search-by-tags', async (req, res) => {
  try {
    const { tags, maxResults = 20 } = req.body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Tags array is required' });
    }

    const videos = await youtubeService.searchByTags(tags, parseInt(maxResults));
    
    res.json({
      success: true,
      data: videos,
      count: videos.length,
      searchedTags: tags
    });
  } catch (error) {
    console.error('YouTube tag search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search by tags',
      message: error.message 
    });
  }
});

export default router;