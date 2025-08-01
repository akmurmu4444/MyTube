import express from 'express';
import Playlist from '../models/Playlist.js';

const router = express.Router();

// Get all playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('videoIds')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: playlists
    });
  } catch (error) {
    console.error('Get playlists error:', error.message);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Create playlist
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = new Playlist({
      name,
      description
    });

    await playlist.save();

    res.status(201).json({
      success: true,
      data: playlist,
      message: 'Playlist created successfully'
    });
  } catch (error) {
    console.error('Create playlist error:', error.message);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id).populate('videoIds');
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    console.error('Get playlist error:', error.message);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Update playlist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const playlist = await Playlist.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('videoIds');

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({
      success: true,
      data: playlist,
      message: 'Playlist updated successfully'
    });
  } catch (error) {
    console.error('Update playlist error:', error.message);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findByIdAndDelete(id);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Delete playlist error:', error.message);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Add video to playlist
router.post('/:id/videos', async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!playlist.videoIds.includes(videoId)) {
      playlist.videoIds.push(videoId);
      await playlist.save();
    }

    const updatedPlaylist = await Playlist.findById(id).populate('videoIds');

    res.json({
      success: true,
      data: updatedPlaylist,
      message: 'Video added to playlist successfully'
    });
  } catch (error) {
    console.error('Add video to playlist error:', error.message);
    res.status(500).json({ error: 'Failed to add video to playlist' });
  }
});

// Remove video from playlist
router.delete('/:id/videos/:videoId', async (req, res) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.videoIds = playlist.videoIds.filter(vid => vid.toString() !== videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(id).populate('videoIds');

    res.json({
      success: true,
      data: updatedPlaylist,
      message: 'Video removed from playlist successfully'
    });
  } catch (error) {
    console.error('Remove video from playlist error:', error.message);
    res.status(500).json({ error: 'Failed to remove video from playlist' });
  }
});

export default router;