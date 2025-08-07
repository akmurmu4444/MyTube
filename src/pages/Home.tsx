import React, { useEffect, useState } from 'react';
import { Sparkles, Search, Video as VideoIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import YouTubeSearch from '../components/YouTubeSearch';
import TagBasedRecommendations from '../components/TagBasedRecommendations';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { loadSavedVideos, addVideo, deleteVideo } from '../redux/slices/videosSlice';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Local UI state
  const [activeTab, setActiveTab] = useState<'discover' | 'search' | 'saved'>('discover');

  // Redux state
  const { videos: savedVideos, loading, error } = useAppSelector(state => state.videos);
  // console.log('Saved Videos:', savedVideos);

  // Load saved videos on mount
  useEffect(() => {
    dispatch(loadSavedVideos());
  }, [dispatch]);

  // Handle saving video from child component
  const handleVideoSaved = (video: any) => {
    dispatch(addVideo(video));
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1 border-gray-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to MyTube</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and save videos from YouTube based on your interests
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'discover', label: 'Discover', icon: Sparkles },
            { key: 'search', label: 'Search YouTube', icon: Search },
            { key: 'saved', label: `My Videos (${savedVideos.length})`, icon: VideoIcon },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'discover' && <TagBasedRecommendations onVideoSaved={handleVideoSaved} />}
        {activeTab === 'search' && <YouTubeSearch onVideoSaved={handleVideoSaved} />}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedVideos.length === 0 ? (
              <div className="text-center py-12">
                <VideoIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved videos yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use the Discover or Search tabs to find and save videos to your collection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedVideos.map(video => (
                  <div
                    key={video._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="cursor-pointer" onClick={() => navigate(`/video/${video._id}`)}>
                      <div className="relative">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-36 object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          {formatDuration(video.duration)}
                        </div>
                        {video.isPinned && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded">📌</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{video.channelTitle}</p>
                        {video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {video.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {video.tags.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">+{video.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{video.watchCount > 0 ? `Watched ${video.watchCount}x` : 'Not watched'}</span>
                          {video.isLiked && <span>❤️</span>}
                        </div>
                        
                        {/* Delete button for user's own videos */}
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this video?')) {
                                dispatch(deleteVideo(video._id) as any);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs flex items-center space-x-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Home;
