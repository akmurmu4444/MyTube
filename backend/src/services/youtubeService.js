import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

class YouTubeService {
  constructor() {
    console.log(process.env.YOUTUBE_API_KEY)
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';

    if (!this.apiKey) {
      console.warn('⚠️  YouTube API key not found. YouTube features will be disabled.');
    }
  }

  // Search videos by query
  async searchVideos(query, maxResults = 25) {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          key: this.apiKey,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults,
          order: 'relevance',
          safeSearch: 'moderate'
        }
      });

      // Get video details including duration
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      const detailsResponse = await axios.get(`${this.baseURL}/videos`, {
        params: {
          key: this.apiKey,
          id: videoIds,
          part: 'snippet,contentDetails,statistics'
        }
      });

      return detailsResponse.data.items.map(video => ({
        youtubeId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        duration: video.contentDetails.duration,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        viewCount: parseInt(video.statistics.viewCount || 0),
        likeCount: parseInt(video.statistics.likeCount || 0)
      }));
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      throw new Error('Failed to search YouTube videos');
    }
  }

  // Get video details by ID
  async getVideoDetails(videoId) {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          key: this.apiKey,
          id: videoId,
          part: 'snippet,contentDetails,statistics'
        }
      });

      const video = response.data.items[0];
      if (!video) {
        throw new Error('Video not found');
      }

      return {
        youtubeId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        duration: video.contentDetails.duration,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        viewCount: parseInt(video.statistics.viewCount || 0),
        likeCount: parseInt(video.statistics.likeCount || 0)
      };
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      throw new Error('Failed to get video details');
    }
  }

  // Search videos by multiple tags/topics
  async searchByTags(tags, maxResults = 10) {
    if (!this.apiKey || !tags.length) {
      return [];
    }

    try {
      const searchPromises = tags.map(tag =>
        this.searchVideos(tag, Math.ceil(maxResults / tags.length))
      );

      const results = await Promise.all(searchPromises);

      // Flatten and deduplicate results
      const allVideos = results.flat();
      const uniqueVideos = allVideos.filter((video, index, self) =>
        index === self.findIndex(v => v.youtubeId === video.youtubeId)
      );

      // Sort by relevance and limit results
      return uniqueVideos
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, maxResults);
    } catch (error) {
      console.error('Tag search error:', error.message);
      return [];
    }
  }

  // Parse duration from ISO 8601 format to seconds
  parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Format duration to human readable
  formatDuration(duration) {
    const totalSeconds = this.parseDuration(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default new YouTubeService();