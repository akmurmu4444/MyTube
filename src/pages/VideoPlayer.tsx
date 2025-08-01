import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { updateVideo } from '../redux/slices/videosSlice';
import { addHistoryEntry, updateWatchPosition } from '../redux/slices/historySlice';
import { addNote } from '../redux/slices/notesSlice';
import { 
  ArrowLeft, 
  Heart, 
  Clock, 
  Pin, 
  StickyNote, 
  Minimize, 
  Maximize,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ThumbsUp,
  Share,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const video = useSelector((state: RootState) => 
    state.videos.videos.find(v => v.id === id)
  );
  const notes = useSelector((state: RootState) => 
    state.notes.notes.filter(n => n.videoId === id)
  );
  const { watchlist } = useSelector((state: RootState) => state.videos);

  useEffect(() => {
    if (video) {
      // Update watch count
      dispatch(updateVideo({
        id: video.id,
        updates: { 
          watchCount: video.watchCount + 1,
          watchedAt: new Date().toISOString()
        }
      }));

      // Add to history (mock duration for now)
      dispatch(addHistoryEntry({
        videoId: video.id,
        duration: 300, // 5 minutes mock duration
        position: 0
      }));
    }
  }, [video, dispatch]);

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Video not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The video you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const getEmbedUrl = (url: string): string => {
    const videoId = extractVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=1`;
    }
    return url;
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLike = () => {
    dispatch(updateVideo({
      id: video.id,
      updates: { isLiked: !video.isLiked }
    }));
  };

  const handlePin = () => {
    dispatch(updateVideo({
      id: video.id,
      updates: { isPinned: !video.isPinned }
    }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    dispatch(addNote({
      videoId: video.id,
      content: noteContent.trim(),
      timestamp: Math.floor(currentTime)
    }));

    setNoteContent('');
    setShowNoteForm(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div 
              ref={containerRef}
              className="relative bg-black rounded-lg overflow-hidden aspect-video"
            >
              <iframe
                ref={iframeRef}
                src={getEmbedUrl(video.url)}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            {/* Video Title */}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {video.title}
              </h1>
            </div>

            {/* Video Stats and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatNumber(video.watchCount)} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(video.addedAt))} ago</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    video.isLiked
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${video.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    {video.isLiked ? 'Liked' : 'Like'}
                  </span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Share className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>

                <button
                  onClick={handlePin}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    video.isPinned
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {video.isPinned ? 'Pinned' : 'Pin'}
                  </span>
                </button>

                <button
                  onClick={() => setShowNoteForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <StickyNote className="w-4 h-4" />
                  <span className="text-sm font-medium">Note</span>
                </button>

                <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Channel Info and Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {video.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {video.title.split(' ').slice(0, 3).join(' ')} Channel
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Personal Collection
                  </p>
                </div>
              </div>

              {video.description && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span>Description</span>
                    {showDescription ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {showDescription && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {video.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notes ({notes.length})
                </h3>
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                >
                  <StickyNote className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No notes yet. Add your first note!
                  </p>
                ) : (
                  notes
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .map(note => (
                      <div
                        key={note.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                      >
                        {note.timestamp && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(note.timestamp)}</span>
                          </div>
                        )}
                        <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {note.content}
                          </ReactMarkdown>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(note.createdAt))} ago
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Video Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Video Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Watch Count</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {video.watchCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Added</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(video.addedAt))} ago
                  </span>
                </div>
                {video.watchedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Watched</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDistanceToNow(new Date(video.watchedAt))} ago
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <div className="flex items-center space-x-2">
                    {video.isLiked && (
                      <span className="text-red-500 text-xs">❤️ Liked</span>
                    )}
                    {video.isPinned && (
                      <span className="text-yellow-500 text-xs">📌 Pinned</span>
                    )}
                    {!video.isLiked && !video.isPinned && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Normal</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Note</h3>
            <form onSubmit={handleAddNote}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note in Markdown..."
                className="w-full h-32 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none border border-gray-300 dark:border-gray-600"
                autoFocus
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current time: {formatTime(currentTime)}
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;