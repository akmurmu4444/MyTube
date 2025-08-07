import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { AppDispatch, useAppSelector } from '../redux/store';
import { updateVideoAsync, toggleLikeAsync } from '../redux/slices/videosSlice';
import { addHistoryEntry, updateWatchPosition } from '../redux/slices/historySlice';
import { addNote } from '../redux/slices/notesSlice';
import { videosAPI, notesAPI, historyAPI } from '../services/api';
import {
  ArrowLeft,
  Heart,
  Clock,
  Pin,
  StickyNote,
  ThumbsUp,
  Share,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [video, setVideo] = useState<any>(null);
  const [videoNotes, setVideoNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Load video data
  useEffect(() => {
    const loadVideo = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await videosAPI.getById(id);
        setVideo(response.data.data);
        
        // Load notes for this video if authenticated
        if (isAuthenticated) {
          const notesResponse = await notesAPI.getAll({ videoId: id });
          setVideoNotes(notesResponse.data.data || []);
        }
      } catch (error: any) {
        console.error('Failed to load video:', error);
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id, isAuthenticated]);

  // Add to history when video loads
  useEffect(() => {
    if (video && isAuthenticated) {
      // Add to history
      historyAPI.add({
        videoId: video._id,
        duration: 300, // Mock duration
        position: 0
      }).catch(console.error);
    }
  }, [video, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <>
        <Helmet>
          <title>Video not found - MyTube</title>
        </Helmet>
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
      </>
    );
  }

  const getEmbedUrl = (): string => {
    return `https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1&origin=${window.location.origin}&autoplay=1`;
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }
    
    try {
      const response = await videosAPI.toggleLike(video._id);
      setVideo({ ...video, ...response.data.data });
    } catch (error: any) {
      toast.error('Failed to update like status');
    }
  };

  const handlePin = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to pin videos');
      return;
    }
    
    try {
      const response = await videosAPI.togglePin(video._id);
      setVideo({ ...video, ...response.data.data });
      toast.success(video.isPinned ? 'Video unpinned' : 'Video pinned');
    } catch (error: any) {
      toast.error('Failed to update pin status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !isAuthenticated) return;

    try {
      const response = await notesAPI.create({
        videoId: video._id,
        content: noteContent.trim(),
        timestamp: Math.floor(currentTime)
      });
      
      setVideoNotes([response.data.data, ...videoNotes]);
      toast.success('Note added successfully!');
      setNoteContent('');
      setShowNoteForm(false);
    } catch (error: any) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesAPI.delete(noteId);
      setVideoNotes(videoNotes.filter(note => note._id !== noteId));
      toast.success('Note deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete note');
    }
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
    <>
      <Helmet>
        <title>{video.title} - MyTube</title>
        <meta name="description" content={video.description || `Watch ${video.title} on MyTube`} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div
              className="relative bg-black rounded-lg overflow-hidden aspect-video"
            >
              {video.youtubeId ? (
                <iframe
                  src={getEmbedUrl()}
                  title={video.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onError={() => {
                    console.error('Video failed to load');
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Video Not Available</h3>
                    <p className="text-gray-400 mb-4">This video cannot be embedded or may have been removed.</p>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <span>Watch on YouTube</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              )}
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
                <span>{formatNumber(video.watchCount || 0)} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(video.addedAt))} ago</span>
                {video.likeCount && (
                  <>
                    <span>•</span>
                    <span>{formatNumber(video.likeCount)} likes</span>
                  </>
                )}
              </div>

              {isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${video.isLiked
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${video.isLiked ? 'fill-current' : ''}`} />
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${video.isPinned
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
              )}
            </div>

            {/* Channel Info and Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {video.channelTitle?.charAt(0).toUpperCase() || 'V'}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {video.channelTitle || 'Unknown Channel'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {video.publishedAt && `Published ${formatDistanceToNow(new Date(video.publishedAt))} ago`}
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
            {isAuthenticated && (
              /* Notes Section */
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notes ({videoNotes.length})
                  </h3>
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {videoNotes.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                      No notes yet. Add your first note!
                    </p>
                  ) : (
                    videoNotes
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map(note => (
                        <div
                          key={note._id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 relative group"
                        >
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          
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
            )}

            {/* Video Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Video Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Watch Count</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {video.watchCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Added</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(video.addedAt))} ago
                  </span>
                </div>
                {video.lastWatchedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Watched</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDistanceToNow(new Date(video.lastWatchedAt))} ago
                    </span>
                  </div>
                )}
                {isAuthenticated && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Form Modal */}
      {showNoteForm && isAuthenticated && (
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
    </>
  );
};

export default VideoPlayer;