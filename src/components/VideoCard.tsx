import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Heart, 
  Clock, 
  Pin, 
  Play, 
  MoreVertical, 
  Trash2,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Video, deleteVideo, toggleLikeAsync } from '../redux/slices/videosSlice';
import { RootState, useAppSelector } from '../redux/store';
import { 
  togglePin, 
  addToWatchlist, 
  removeFromWatchlist
} from '../redux/slices/videosSlice';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface VideoCardProps {
  video: Video;  
  isInWatchlist?: boolean;
  showDeleteButton?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  isInWatchlist = false,
  showDeleteButton = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const handlePlay = () => {
    // Navigate to video player page using the video ID
    navigate(`/video/${video._id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }
    dispatch(toggleLikeAsync(video._id) as any);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to pin videos');
      return;
    }
    dispatch(togglePin(video._id));
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to watchlist');
      return;
    }
    if (isInWatchlist) {
      dispatch(removeFromWatchlist(video._id));
    } else {
      dispatch(addToWatchlist(video._id));
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this video? This will also delete all associated notes and history.')) {
      dispatch(deleteVideo(video._id) as any);
    }
    setShowMenu(false);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={handlePlay}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-200 transform scale-90 group-hover:scale-100"
          >
            <Play className="w-6 h-6 ml-1" />
          </button>
        </div>
        {video.isPinned && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded">
            <Pin className="w-4 h-4" />
          </div>
        )}
        {showDeleteButton && (
          <div className="absolute top-2 right-2 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 
          className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={handlePlay}
        >
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        {video.channelTitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {video.channelTitle}
          </p>
        )}

        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{video.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>Added {formatDistanceToNow(new Date(video.addedAt))} ago</span>
          {video.watchCount > 0 && (
            <span>Watched {video.watchCount} time{video.watchCount > 1 ? 's' : ''}</span>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg transition-colors ${
                  video.isLiked
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={video.isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-4 h-4 ${video.isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleWatchlist}
                className={`p-2 rounded-lg transition-colors ${
                  isInWatchlist
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Clock className="w-4 h-4" />
              </button>

              <button
                onClick={handlePin}
                className={`p-2 rounded-lg transition-colors ${
                  video.isPinned
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={video.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handlePlay}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Watch
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex justify-end">
            <button
              onClick={handlePlay}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Watch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;