import { configureStore } from '@reduxjs/toolkit';
import videosReducer from './slices/videosSlice';
import playlistsReducer from './slices/playlistsSlice';
import tagsReducer from './slices/tagsSlice';
import notesReducer from './slices/notesSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    videos: videosReducer,
    playlists: playlistsReducer,
    tags: tagsReducer,
    notes: notesReducer,
    history: historyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;