import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { videosAPI } from '../../services/api';

export interface Video {
  id: string; // we'll keep this as youtubeId for now
  youtubeId: string;
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
  loading: boolean;
  error: string | null;
}

const initialState: VideosState = {
  videos: [],
  watchlist: [],
  liked: [],
  searchQuery: '',
  selectedTags: [],
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  loading: false,
  error: null,
};

//
// ✅ Async thunks
//

// Fetch all videos
export const fetchVideos = createAsyncThunk<
  Video[],
  void,
  { rejectValue: string }
>('videos/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await videosAPI.getAll();
    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch videos');
  }
});

// Save new video
export const saveVideo = createAsyncThunk<
  Video,
  string,
  { rejectValue: string }
>('videos/save', async (youtubeId, thunkAPI) => {
  try {
    const response = await videosAPI.save({ youtubeId });
    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to save video');
  }
});

// Update video
export const updateVideoAsync = createAsyncThunk<
  Video,
  { id: string; updates: Partial<Video> },
  { rejectValue: string }
>('videos/update', async ({ id, updates }, thunkAPI) => {
  try {
    const response = await videosAPI.update(id, updates);
    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update video');
  }
});

// ✅ Thunk to load videos
export const loadSavedVideos = createAsyncThunk(
  'videos/loadSavedVideos',
  async () => {
    const response = await videosAPI.getAll({ limit: 20, sortBy: 'addedAt', sortOrder: 'desc' });
    return response.data.data;
  }
);

//
// ✅ Slice
//

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
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
    toggleLike: (state, action: PayloadAction<string>) => {
      const video = state.videos.find(v => v.id === action.payload);
      if (video) {
        video.isLiked = !video.isLiked;
        if (video.isLiked) {
          if (!state.liked.includes(video.id)) state.liked.push(video.id);
        } else {
          state.liked = state.liked.filter(id => id !== video.id);
        }
      }
    },
    togglePin: (state, action: PayloadAction<string>) => {
      const video = state.videos.find(v => v.id === action.payload);
      if (video) video.isPinned = !video.isPinned;
    },
    addToWatchlist: (state, action: PayloadAction<string>) => {
      if (!state.watchlist.includes(action.payload)) {
        state.watchlist.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(id => id !== action.payload);
    },
    removeVideo: (state, action: PayloadAction<string>) => {
      state.videos = state.videos.filter(v => v.id !== action.payload);
      state.watchlist = state.watchlist.filter(id => id !== action.payload);
      state.liked = state.liked.filter(id => id !== action.payload);
    },
    // ✅ This must be here!
    addVideo: (state, action: PayloadAction<Video>) => {
      state.videos.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch videos
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch videos';
      });
    // Save video
    builder
      .addCase(saveVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.videos.push({
          ...action.payload,
          id: action.payload.youtubeId, // use youtubeId as id
        });
      })
      .addCase(saveVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save video';
      });
    // Update video
    builder
      .addCase(updateVideoAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideoAsync.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.videos.findIndex(v => v.id === action.payload.youtubeId);
        if (idx !== -1) {
          state.videos[idx] = {
            ...state.videos[idx],
            ...action.payload,
          };
        }
      })
      .addCase(updateVideoAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update video';
      });
  },
});

//
// ✅ Exports
//

export const {
  setSearchQuery,
  setSelectedTags,
  setSortBy,
  setSortOrder,
  toggleLike,
  togglePin,
  addToWatchlist,
  removeFromWatchlist,
  removeVideo,
  addVideo
} = videosSlice.actions;

export default videosSlice.reducer;