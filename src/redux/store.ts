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
  // optional: you can add middleware, devTools, etc.
});

// ✅ Root state type
export type RootState = ReturnType<typeof store.getState>;

// ✅ App dispatch type
export type AppDispatch = typeof store.dispatch;

// ✅ (Recommended) Typed hooks
// Instead of plain useDispatch/useSelector, use these:
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
