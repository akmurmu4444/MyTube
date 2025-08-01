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
  Pause
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Video not found</h2>
          <p className="text-gray-400 mb-4">The video you're looking for doesn't exist.</p>
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
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
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

  return (
    <div 
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-900`}
    >
      <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 py-6'}`}>
        {/* Header - hidden in fullscreen */}
        {!isFullscreen && (
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg transition-colors ${
                  video.isLiked
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${video.isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handlePin}
                className={`p-2 rounded-lg transition-colors ${
                  video.isPinned
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Pin className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowNoteForm(true)}
                className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <StickyNote className="w-5 h-5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
          {/* Video Player */}
          <div className={`${isFullscreen ? 'h-full' : 'lg:col-span-2'}`}>
            <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
              <iframe
                ref={iframeRef}
                src={getEmbedUrl(video.url)}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              
              {/* Fullscreen controls overlay */}
              {isFullscreen && (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="p-2 rounded-lg bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                  >
                    <StickyNote className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                  >
                    <Minimize className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Video Info - hidden in fullscreen */}
            {!isFullscreen && (
              <div className="mt-4">
                <h1 className="text-xl font-bold text-white mb-2">{video.title}</h1>
                {video.description && (
                  <p className="text-gray-300 mb-4">{video.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    Watched {video.watchCount} time{video.watchCount !== 1 ? 's' : ''}
                  </span>
                  {video.watchedAt && (
                    <span>
                      Last watched: {new Date(video.watchedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes Sidebar - hidden in fullscreen */}
          {!isFullscreen && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Notes</h3>
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.length === 0 ? (
                    <p className="text-gray-400 text-sm">No notes yet. Add your first note!</p>
                  ) : (
                    notes
                      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                      .map(note => (
                        <div
                          key={note.id}
                          className="bg-gray-700 rounded-lg p-3"
                        >
                          {note.timestamp && (
                            <div className="flex items-center space-x-1 text-xs text-gray-400 mb-2">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(note.timestamp)}</span>
                            </div>
                          )}
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {note.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Note</h3>
            <form onSubmit={handleAddNote}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note in Markdown..."
                className="w-full h-32 px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                autoFocus
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-gray-400">
                  Current time: {formatTime(currentTime)}
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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