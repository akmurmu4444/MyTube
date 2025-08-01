import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { updateNote, deleteNote } from '../redux/slices/notesSlice';
import { StickyNote, Edit3, Trash2, Clock, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Notes: React.FC = () => {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();
  const notes = useSelector((state: RootState) => state.notes.notes);
  const videos = useSelector((state: RootState) => state.videos.videos);

  const filteredNotes = notes.filter(note => {
    const video = videos.find(v => v.id === note.videoId);
    const videoTitle = video?.title || '';
    
    return (
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      videoTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleEdit = (noteId: string, content: string) => {
    setEditingNote(noteId);
    setEditContent(content);
  };

  const handleSave = (noteId: string) => {
    dispatch(updateNote({ id: noteId, content: editContent }));
    setEditingNote(null);
    setEditContent('');
  };

  const handleDelete = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      dispatch(deleteNote(noteId));
    }
  };

  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StickyNote className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No notes match your search' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search terms.'
                : 'Start taking notes while watching videos to keep track of important moments and thoughts.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map(note => {
              const video = videos.find(v => v.id === note.videoId);
              return (
                <div
                  key={note.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {video && (
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {video.title}
                            </h4>
                            {note.timestamp && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(note.timestamp)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(note.id, note.content)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    {editingNote === note.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          placeholder="Write your note in Markdown..."
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(note.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNote(null)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {note.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {note.createdAt !== note.updatedAt ? (
                      <span>Updated {formatDistanceToNow(new Date(note.updatedAt))} ago</span>
                    ) : (
                      <span>Created {formatDistanceToNow(new Date(note.createdAt))} ago</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Notes;