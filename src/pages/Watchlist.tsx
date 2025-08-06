import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import VideoCard from '../components/VideoCard';
import { Clock } from 'lucide-react';

const Watchlist: React.FC = () => {
  const { videos, watchlist } = useSelector((state: RootState) => state.videos);
  
  const watchlistVideos = videos.filter(video => watchlist.includes(video.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {watchlistVideos.length} video{watchlistVideos.length !== 1 ? 's' : ''} to watch
          </p>
        </div>
      </div>

      {watchlistVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add videos to your watchlist to keep track of what you want to watch later.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlistVideos.map(video => (
            <VideoCard
              key={video._id}
              video={video}
              isInWatchlist={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;