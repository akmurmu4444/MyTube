import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { videosAPI } from '../../services/api';
import toast from 'react-hot-toast';

export interface Video {
  _id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration?: string;
  description?: string;
  channelTitle: string;
  publishedAt: string;
  tags: string[];
  isLiked: boolean;
  isPinned: boolean;
  isInWatchlist: boolean;
  addedAt: string;
  watchedAt?: string;
  watchCount: number;
  likeCount?: number;
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
    toast.success('Video saved successfully!');
    return response.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save video');
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
    toast.error(error.response?.data?.message || 'Failed to update video');
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update video');
  }
});

// Delete video
export const deleteVideo = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('videos/delete', async (id, thunkAPI) => {
  try {
    await videosAPI.delete(id);
    toast.success('Video deleted successfully!');
    return id;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to delete video');
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete video');
  }
});

// Toggle like
export const toggleLikeAsync = createAsyncThunk<
  Video,
  string,
  { rejectValue: string }
>('videos/toggleLike', async (id, thunkAPI) => {
  try {
    const response = await videosAPI.toggleLike(id);
    const isLiked = response.data.data.isLiked;
    toast.success(isLiked ? 'Added to liked videos!' : 'Removed from liked videos!');
    return response.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to update like status');
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update like status');
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
      const video = state.videos.find(v => v._id === action.payload);
      if (video) {
        video.isLiked = !video.isLiked;
        if (video.isLiked) {
          if (!state.liked.includes(video._id)) state.liked.push(video._id);
        } else {
          state.liked = state.liked.filter(id => id !== video._id);
        }
      }
    },
    togglePin: (state, action: PayloadAction<string>) => {
      const video = state.videos.find(v => v._id === action.payload);
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
      state.videos = state.videos.filter(v => v._id !== action.payload);
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
        state.videos.unshift(action.payload);
      })
      .addCase(saveVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save video';
      });
    // Update video
    builder
      .addCase(updateVideoAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(updateVideoAsync.fulfilled, (state, action) => {
        const idx = state.videos.findIndex(v => v._id === action.payload._id);
        if (idx !== -1) {
          state.videos[idx] = {
            ...state.videos[idx],
            ...action.payload,
          };
        }
      })
      .addCase(updateVideoAsync.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update video';
      });
    // Delete video
    builder
      .addCase(deleteVideo.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.videos = state.videos.filter(v => v._id !== action.payload);
        state.watchlist = state.watchlist.filter(id => id !== action.payload);
        state.liked = state.liked.filter(id => id !== action.payload);
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete video';
      });
    // Toggle like
    builder
      .addCase(toggleLikeAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleLikeAsync.fulfilled, (state, action) => {
        const idx = state.videos.findIndex(v => v._id === action.payload._id);
        if (idx !== -1) {
          state.videos[idx] = {
            ...state.videos[idx],
            ...action.payload,
          };
        }
      })
      .addCase(toggleLikeAsync.rejected, (state, action) => {
        state.error = action.payload || 'Failed to toggle like';
      });
    // Load saved videos
    builder
      .addCase(loadSavedVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSavedVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(loadSavedVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Failed to load videos';
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