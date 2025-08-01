import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HistoryEntry {
  id: string;
  videoId: string;
  watchedAt: string;
  duration: number; // in seconds
  position: number; // last watched position in seconds
}

interface HistoryState {
  history: HistoryEntry[];
  totalWatchTime: number; // in seconds
}

const initialState: HistoryState = {
  history: [],
  totalWatchTime: 0,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistoryEntry: (state, action: PayloadAction<{ videoId: string; duration: number; position: number }>) => {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        videoId: action.payload.videoId,
        watchedAt: new Date().toISOString(),
        duration: action.payload.duration,
        position: action.payload.position,
      };
      state.history.push(entry);
      state.totalWatchTime += action.payload.duration;
    },
    updateWatchPosition: (state, action: PayloadAction<{ videoId: string; position: number }>) => {
      const { videoId, position } = action.payload;
      const latestEntry = state.history
        .filter(entry => entry.videoId === videoId)
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())[0];
      
      if (latestEntry) {
        latestEntry.position = position;
      }
    },
    clearHistory: (state) => {
      state.history = [];
      state.totalWatchTime = 0;
    },
  },
});

export const { addHistoryEntry, updateWatchPosition, clearHistory } = historySlice.actions;

export default historySlice.reducer;