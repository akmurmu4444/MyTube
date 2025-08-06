import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import VideoCard from '../components/VideoCard';
import { Heart } from 'lucide-react';

const Liked: React.FC = () => {
  const { videos, liked, watchlist } = useSelector((state: RootState) => state.videos);
  
  const likedVideos = videos.filter(video => video.isLiked);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liked Videos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {likedVideos.length} liked video{likedVideos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {likedVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No liked videos yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Like videos to keep track of your favorites and find them easily later.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {likedVideos.map(video => (
            <VideoCard
              key={video._id}
              video={video}
              isInWatchlist={video.isInWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Liked;