import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ This enables sending cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor to attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const persistedRoot = localStorage.getItem('persist:root');
    if (persistedRoot) {
      const parsedRoot = JSON.parse(persistedRoot);
      const auth = JSON.parse(parsedRoot.auth || '{}'); // adjust 'auth' based on your slice name
      const token = auth.token; // adjust 'token' if your key is different

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// YouTube API endpoints
export const youtubeAPI = {
  search: (query: string, maxResults = 25) =>
    api.get(`/youtube/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`),

  getVideoDetails: (videoId: string) =>
    api.get(`/youtube/video/${videoId}`),

  searchByTags: (tags: string[], maxResults = 20) =>
    api.post('/youtube/search-by-tags', { tags, maxResults }),
};

// Video management endpoints
type VideoUpdateFields = {
  title?: string;
  tags?: string[];
  isLiked?: boolean;
  pinned?: boolean;
  notes?: string;
  playlists?: string[];
  // Add more fields as needed
};

const allowedFields: (keyof VideoUpdateFields)[] = [
  'title',
  'tags',
  'isLiked',
  'pinned',
  'notes',
  'playlists',
  // extend this list as needed
];

export function sanitizeVideoUpdate(data: any): VideoUpdateFields {
  const sanitized: Partial<VideoUpdateFields> = {};
  console.log('Sanitizing video update data:', data);

  for (const key of allowedFields) {
    if (data.hasOwnProperty(key)) {
      sanitized[key] = data[key];
    }
  }
  console.log('Sanitized video update data:', sanitized);
  return sanitized;
}

export const videosAPI = {
  getAll: (params?: {
    search?: string;
    tags?: string[];
    liked?: boolean;
    pinned?: boolean;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    page?: number;
  }) => api.get('/videos', { params }),

  getById: (id: string) =>
    api.get(`/videos/${id}`),

  save: (data: { youtubeId: string; tags?: string[] }) =>
    api.post('/videos', data),

  update: (id: string, data: Partial<{
    title: string;
    description: string;
    tags: string[];
    liked: boolean;
    pinned: boolean;
    notes: string;
    playlists: string[];
  }>) => api.patch(`/videos/${id}`, sanitizeVideoUpdate(data)),

  delete: (id: string) =>
    api.delete(`/videos/${id}`),

  toggleLike: (id: string) =>
    api.patch(`/videos/${id}/like`),

  togglePin: (id: string) =>
    api.patch(`/videos/${id}/pin`),

  toggleWatchlist: (id: string) =>
    api.patch(`/videos/${id}/watchlist`),
};


// Playlist endpoints
export const playlistsAPI = {
  getAll: () => api.get('/playlists'),

  create: (data: { name: string; description?: string }) =>
    api.post('/playlists', data),

  getById: (id: string) =>
    api.get(`/playlists/${id}`),

  update: (id: string, data: any) =>
    api.put(`/playlists/${id}`, data),

  delete: (id: string) =>
    api.delete(`/playlists/${id}`),

  addVideo: (playlistId: string, videoId: string) =>
    api.post(`/playlists/${playlistId}/videos`, { videoId }),

  removeVideo: (playlistId: string, videoId: string) =>
    api.delete(`/playlists/${playlistId}/videos/${videoId}`),
};

// Notes endpoints
export const notesAPI = {
  getAll: (params?: { videoId?: string; search?: string }) =>
    api.get('/notes', { params }),

  create: (data: { videoId: string; content: string; timestamp?: number }) =>
    api.post('/notes', data),

  update: (id: string, data: { content: string; timestamp?: number }) =>
    api.put(`/notes/${id}`, data),

  delete: (id: string) =>
    api.delete(`/notes/${id}`),
};

// History endpoints
export const historyAPI = {
  getAll: (params?: {
    videoId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }) => api.get('/history', { params }),

  add: (data: { videoId: string; duration: number; position?: number }) =>
    api.post('/history', data),

  getStats: (period?: 'day' | 'week' | 'month' | 'all') =>
    api.get(`/history/stats?period=${period || 'week'}`),

  clear: () =>
    api.delete('/history'),
};

// Tags endpoints
export const tagsAPI = {
  getAll: () => api.get('/tags'),

  create: (data: { name: string; color?: string }) =>
    api.post('/tags', data),

  update: (id: string, data: { name?: string; color?: string }) =>
    api.put(`/tags/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tags/${id}`),
};

export default api;