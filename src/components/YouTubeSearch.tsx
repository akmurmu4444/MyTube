import React, { useState, useEffect } from 'react';
import { Search, Plus, Clock, Eye, ThumbsUp } from 'lucide-react';
import { youtubeAPI, videosAPI } from '../services/api';
import { YouTubeVideo } from '../types/api';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface YouTubeSearchProps {
  onVideoSaved?: (video: any) => void;
}

const YouTubeSearch: React.FC<YouTubeSearchProps> = ({ onVideoSaved }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingVideoId, setSavingVideoId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { isDark } = useTheme();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await youtubeAPI.search(query);
      setResults(response.data.data || []);
      // console.log('Search results:', response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search YouTube');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVideo = async (video: YouTubeVideo) => {
    setSavingVideoId(video.youtubeId);

    try {
      const response = await videosAPI.save({
        youtubeId: video.youtubeId,
        tags: []
      });

      if (onVideoSaved) {
        onVideoSaved(response.data.data);
      }

      // Navigate to video player after saving
      setTimeout(() => {
        navigate(`/video/${response.data.data._id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save video');
    } finally {
      setSavingVideoId(null);
    }
  };

  const formatDuration = (duration: string): string => {
    // Parse ISO 8601 duration (PT4M13S) to readable format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search YouTube videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Results ({results.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {results.map((video) => (
              <div
                key={video.youtubeId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative cursor-pointer">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-32 object-cover aspect-video"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                    {video.title}
                  </h4>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {video.channelTitle}
                  </p>

                  {(video.viewCount || video.likeCount) && (
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {video.viewCount && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(video.viewCount)}</span>
                        </div>
                      )}
                      {video.likeCount && (
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{formatNumber(video.likeCount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleSaveVideo(video);
                    }}
                    disabled={savingVideoId === video.youtubeId}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {savingVideoId === video.youtubeId ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Save Video</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {query && !loading && results.length === 0 && !error && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">
            No videos found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;