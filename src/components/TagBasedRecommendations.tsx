import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Plus } from 'lucide-react';
import { youtubeAPI, videosAPI, tagsAPI } from '../services/api';
import { YouTubeVideo, Tag } from '../types/api';
import { useTheme } from '../context/ThemeContext';

interface TagBasedRecommendationsProps {
  onVideoSaved?: (video: any) => void;
}

const TagBasedRecommendations: React.FC<TagBasedRecommendationsProps> = ({ onVideoSaved }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingVideoId, setSavingVideoId] = useState<string | null>(null);
  
  const { isDark } = useTheme();

  // Load tags on component mount
  useEffect(() => {
    loadTags();
  }, []);

  // Auto-load recommendations when tags are selected
  useEffect(() => {
    if (selectedTags.length > 0) {
      loadRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [selectedTags]);

  const loadTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setTags(response.data.data || []);
      
      // Auto-select top 3 most used tags
      const topTags = response.data.data
        .sort((a: Tag, b: Tag) => b.usageCount - a.usageCount)
        .slice(0, 3)
        .map((tag: Tag) => tag.name);
      
      setSelectedTags(topTags);
    } catch (err: any) {
      console.error('Failed to load tags:', err);
    }
  };

  const loadRecommendations = async () => {
    if (selectedTags.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await youtubeAPI.searchByTags(selectedTags, 12);
      setRecommendations(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSaveVideo = async (video: YouTubeVideo) => {
    setSavingVideoId(video.youtubeId);
    
    try {
      const response = await videosAPI.save({
        youtubeId: video.youtubeId,
        tags: selectedTags
      });
      
      if (onVideoSaved) {
        onVideoSaved(response.data.data);
      }
      
      console.log('✅ Video saved successfully');
    } catch (err: any) {
      console.error('❌ Failed to save video:', err.response?.data?.message);
      setError(err.response?.data?.message || 'Failed to save video');
    } finally {
      setSavingVideoId(null);
    }
  };

  const formatDuration = (duration: string): string => {
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

  return (
    <div className="space-y-6">
      {/* Tag Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span>Discover by Your Topics</span>
          </h3>
          
          <button
            onClick={loadRecommendations}
            disabled={loading || selectedTags.length === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag._id}
                onClick={() => handleTagToggle(tag.name)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag.name)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedTags.includes(tag.name) ? tag.color : undefined
                }}
              >
                {tag.name}
                {tag.usageCount > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({tag.usageCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No tags found. Create some tags to get personalized recommendations!
            </p>
          </div>
        )}
      </div>

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Finding videos for:</strong> {selectedTags.join(', ')}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Finding videos for your topics...
          </p>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length > 0 && !loading && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Recommended Videos ({recommendations.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.map((video) => (
              <div
                key={video.youtubeId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                
                <div className="p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                    {video.title}
                  </h5>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {video.channelTitle}
                  </p>
                  
                  <button
                    onClick={() => handleSaveVideo(video)}
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
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Recommendations */}
      {selectedTags.length > 0 && !loading && recommendations.length === 0 && !error && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">
            No recommendations found for your selected topics.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Try selecting different tags or refresh to get new results.
          </p>
        </div>
      )}

      {/* No Tags Selected */}
      {selectedTags.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Select some topics above to get personalized video recommendations!
          </p>
        </div>
      )}
    </div>
  );
};

export default TagBasedRecommendations;