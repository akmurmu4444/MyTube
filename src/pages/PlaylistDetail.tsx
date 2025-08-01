import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { 
  updatePlaylist, 
  addVideoToPlaylist, 
  removeVideoFromPlaylist,
  reorderPlaylistVideos 
} from '../redux/slices/playlistsSlice';
import VideoCard from '../components/VideoCard';
import { ArrowLeft, Edit3, Plus, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddVideo, setShowAddVideo] = useState(false);

  const playlist = useSelector((state: RootState) => 
    state.playlists.playlists.find(p => p.id === id)
  );
  const { videos, watchlist } = useSelector((state: RootState) => state.videos);

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Playlist not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The playlist you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/playlists')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Back to Playlists
        </button>
      </div>
    );
  }

  const playlistVideos = playlist.videoIds
    .map(videoId => videos.find(v => v.id === videoId))
    .filter(video => video !== undefined);

  const availableVideos = videos.filter(video => 
    !playlist.videoIds.includes(video.id)
  );

  const handleEdit = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    dispatch(updatePlaylist({
      id: playlist.id,
      updates: {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      }
    }));
    setIsEditing(false);
  };

  const handleAddVideo = (videoId: string) => {
    dispatch(addVideoToPlaylist({ playlistId: playlist.id, videoId }));
  };

  const handleRemoveVideo = (videoId: string) => {
    dispatch(removeVideoFromPlaylist({ playlistId: playlist.id, videoId }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newVideoIds = Array.from(playlist.videoIds);
    const [reorderedItem] = newVideoIds.splice(result.source.index, 1);
    newVideoIds.splice(result.destination.index, 0, reorderedItem);

    dispatch(reorderPlaylistVideos({
      playlistId: playlist.id,
      videoIds: newVideoIds
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/playlists')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-bold bg-transparent border-b-2 border-blue-600 focus:outline-none text-gray-900 dark:text-white"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full text-gray-600 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-600"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {playlist.name}
                </h1>
                <button
                  onClick={handleEdit}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              {playlist.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {playlist.description}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {playlistVideos.length} video{playlistVideos.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddVideo(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </button>
      </div>

      {showAddVideo && availableVideos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Add Videos to Playlist
            </h3>
            <button
              onClick={() => setShowAddVideo(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {availableVideos.map(video => (
              <div
                key={video.id}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                </div>
                <button
                  onClick={() => handleAddVideo(video.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {playlistVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              This playlist is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some videos to get started.
            </p>
            <button
              onClick={() => setShowAddVideo(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Videos
            </button>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="playlist-videos">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {playlistVideos.map((video, index) => (
                  <Draggable key={video.id} draggableId={video.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                      >
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {video.title}
                          </h4>
                          {video.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRemoveVideo(video.id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default PlaylistDetail;