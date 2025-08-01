import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface PlaylistsState {
  playlists: Playlist[];
}

const initialState: PlaylistsState = {
  playlists: [],
};

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    createPlaylist: (state, action: PayloadAction<{ name: string; description?: string }>) => {
      const playlist: Playlist = {
        id: Date.now().toString(),
        name: action.payload.name,
        description: action.payload.description,
        videoIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.playlists.push(playlist);
    },
    deletePlaylist: (state, action: PayloadAction<string>) => {
      state.playlists = state.playlists.filter(playlist => playlist.id !== action.payload);
    },
    updatePlaylist: (state, action: PayloadAction<{ id: string; updates: Partial<Playlist> }>) => {
      const { id, updates } = action.payload;
      const playlistIndex = state.playlists.findIndex(playlist => playlist.id === id);
      if (playlistIndex !== -1) {
        state.playlists[playlistIndex] = {
          ...state.playlists[playlistIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    addVideoToPlaylist: (state, action: PayloadAction<{ playlistId: string; videoId: string }>) => {
      const { playlistId, videoId } = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist && !playlist.videoIds.includes(videoId)) {
        playlist.videoIds.push(videoId);
        playlist.updatedAt = new Date().toISOString();
      }
    },
    removeVideoFromPlaylist: (state, action: PayloadAction<{ playlistId: string; videoId: string }>) => {
      const { playlistId, videoId } = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.videoIds = playlist.videoIds.filter(id => id !== videoId);
        playlist.updatedAt = new Date().toISOString();
      }
    },
    reorderPlaylistVideos: (state, action: PayloadAction<{ playlistId: string; videoIds: string[] }>) => {
      const { playlistId, videoIds } = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.videoIds = videoIds;
        playlist.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  reorderPlaylistVideos,
} = playlistsSlice.actions;

export default playlistsSlice.reducer;