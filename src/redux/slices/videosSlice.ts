import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration?: string;
  description?: string;
  tags: string[];
  isLiked: boolean;
  isPinned: boolean;
  addedAt: string;
  watchedAt?: string;
  watchCount: number;
}

interface VideosState {
  videos: Video[];
  watchlist: string[];
  liked: string[];
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'dateAdded' | 'title' | 'watchCount';
  sortOrder: 'asc' | 'desc';
}

const initialState: VideosState = {
  videos: [],
  watchlist: [],
  liked: [],
  searchQuery: '',
  selectedTags: [],
  sortBy: 'dateAdded',
  sortOrder: 'desc',
};

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    addVideo: (state, action: PayloadAction<Omit<Video, 'id' | 'addedAt' | 'watchCount'>>) => {
      const video: Video = {
        ...action.payload,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
        watchCount: 0,
      };
      state.videos.push(video);
    },
    removeVideo: (state, action: PayloadAction<string>) => {
      state.videos = state.videos.filter(video => video.id !== action.payload);
      state.watchlist = state.watchlist.filter(id => id !== action.payload);
      state.liked = state.liked.filter(id => id !== action.payload);
    },
    updateVideo: (state, action: PayloadAction<{ id: string; updates: Partial<Video> }>) => {
      const { id, updates } = action.payload;
      const videoIndex = state.videos.findIndex(video => video.id === id);
      if (videoIndex !== -1) {
        state.videos[videoIndex] = { ...state.videos[videoIndex], ...updates };
      }
    },
    addToWatchlist: (state, action: PayloadAction<string>) => {
      if (!state.watchlist.includes(action.payload)) {
        state.watchlist.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(id => id !== action.payload);
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.isLiked = !video.isLiked;
        if (video.isLiked) {
          if (!state.liked.includes(videoId)) {
            state.liked.push(videoId);
          }
        } else {
          state.liked = state.liked.filter(id => id !== videoId);
        }
      }
    },
    togglePin: (state, action: PayloadAction<string>) => {
      const video = state.videos.find(v => v.id === action.payload);
      if (video) {
        video.isPinned = !video.isPinned;
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'dateAdded' | 'title' | 'watchCount'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
  },
});

export const {
  addVideo,
  removeVideo,
  updateVideo,
  addToWatchlist,
  removeFromWatchlist,
  toggleLike,
  togglePin,
  setSearchQuery,
  setSelectedTags,
  setSortBy,
  setSortOrder,
} = videosSlice.actions;

export default videosSlice.reducer;