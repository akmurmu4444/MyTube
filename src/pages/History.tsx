import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearHistory } from '../redux/slices/historySlice';
import VideoCard from '../components/VideoCard';
import { History as HistoryIcon, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow, format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const History: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { history, totalWatchTime } = useSelector((state: RootState) => state.history);
  const { videos, watchlist } = useSelector((state: RootState) => state.videos);

  const filteredHistory = history.filter(entry => {
    const entryDate = new Date(entry.watchedAt);
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        return isWithinInterval(entryDate, {
          start: startOfDay(now),
          end: endOfDay(now)
        });
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      default:
        return true;
    }
  });

  const uniqueVideoIds = Array.from(new Set(filteredHistory.map(entry => entry.videoId)));
  const historyVideos = uniqueVideoIds
    .map(videoId => videos.find(v => v._id === videoId))
    .filter(video => video !== undefined);

  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your watch history? This action cannot be undone.')) {
      dispatch(clearHistory());
    }
  };

  const getVideoWatchCount = (videoId: string) => {
    return filteredHistory.filter(entry => entry.videoId === videoId).length;
  };

  const getLastWatchedTime = (videoId: string) => {
    const entries = filteredHistory.filter(entry => entry.videoId === videoId);
    if (entries.length === 0) return null;
    
    const latest = entries.sort((a, b) => 
      new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
    )[0];
    
    return latest.watchedAt;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HistoryIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watch History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredHistory.length} watch session{filteredHistory.length !== 1 ? 's' : ''} • 
              Total time: {formatWatchTime(totalWatchTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedPeriod === 'all' ? 'No watch history yet' : `No videos watched ${selectedPeriod}`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedPeriod === 'all' 
                ? 'Your watch history will appear here as you watch videos.'
                : 'Try selecting a different time period to see your watch history.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recent Activity Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredHistory
                .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
                .slice(0, 10)
                .map(entry => {
                  const video = videos.find(v => v._id === entry.videoId);
                  if (!video) return null;
                  
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => navigate(`/video/${video._id}`)}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {video.title}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            Watched {formatDistanceToNow(new Date(entry.watchedAt))} ago
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Videos Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Watched Videos ({historyVideos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {historyVideos
                .sort((a, b) => {
                  const aTime = getLastWatchedTime(a._id);
                  const bTime = getLastWatchedTime(b._id);
                  if (!aTime || !bTime) return 0;
                  return new Date(bTime).getTime() - new Date(aTime).getTime();
                })
                .map(video => {
                  const watchCount = getVideoWatchCount(video._id);
                  const lastWatched = getLastWatchedTime(video._id);
                  
                  return (
                    <div key={video._id} className="relative">
                      <VideoCard
                        video={video}
                        isInWatchlist={video.isInWatchlist}
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        Watched {watchCount} time{watchCount > 1 ? 's' : ''}
                      </div>
                      {lastWatched && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Last watched {formatDistanceToNow(new Date(lastWatched))} ago
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;