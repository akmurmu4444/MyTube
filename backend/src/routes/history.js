import express from 'express';
import History from '../models/History.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get watch history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      videoId, 
      startDate, 
      endDate, 
      limit = 50, 
      page = 1 
    } = req.query;
    
    let query = { userId: req.user._id };
    
    if (videoId) {
      query.videoId = videoId;
    }
    
    if (startDate || endDate) {
      query.watchedAt = {};
      if (startDate) query.watchedAt.$gte = new Date(startDate);
      if (endDate) query.watchedAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const history = await History.find(query)
      .populate('videoId')
      .sort({ watchedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await History.countDocuments(query);

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get history error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Add history entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { videoId, duration, position = 0 } = req.body;
    
    if (!videoId || !duration) {
      return res.status(400).json({ error: 'Video ID and duration are required' });
    }

    const historyEntry = new History({
      userId: req.user._id,
      videoId,
      duration,
      position
    });

    await historyEntry.save();
    await historyEntry.populate('videoId');

    res.status(201).json({
      success: true,
      data: historyEntry,
      message: 'History entry created successfully'
    });
  } catch (error) {
    console.error('Create history error:', error.message);
    res.status(500).json({ error: 'Failed to create history entry' });
  }
});

// Get watch statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const stats = await History.aggregate([
      {
        $match: {
          userId: req.user._id,
          watchedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWatchTime: { $sum: '$duration' },
          totalSessions: { $sum: 1 },
          uniqueVideos: { $addToSet: '$videoId' }
        }
      },
      {
        $project: {
          totalWatchTime: 1,
          totalSessions: 1,
          uniqueVideosCount: { $size: '$uniqueVideos' }
        }
      }
    ]);

    const result = stats[0] || {
      totalWatchTime: 0,
      totalSessions: 0,
      uniqueVideosCount: 0
    };

    res.json({
      success: true,
      data: {
        period,
        ...result
      }
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Clear history
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const result = await History.deleteMany({ userId: req.user._id });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} history entries`
    });
  } catch (error) {
    console.error('Clear history error:', error.message);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router;