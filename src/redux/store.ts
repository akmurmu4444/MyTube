import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import videosReducer from './slices/videosSlice';
import playlistsReducer from './slices/playlistsSlice';
import tagsReducer from './slices/tagsSlice';
import notesReducer from './slices/notesSlice';
import historyReducer from './slices/historySlice';
import authReducer from './slices/authSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  videos: videosReducer,
  playlists: playlistsReducer,
  tags: tagsReducer,
  notes: notesReducer,
  history: historyReducer,
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'videos', 'playlists', 'notes', 'history'], // Only persist auth state
  blacklist: [] // Don't persist these (fetch fresh)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// ✅ Root state type
export type RootState = ReturnType<typeof store.getState>;

// ✅ App dispatch type
export type AppDispatch = typeof store.dispatch;

// ✅ (Recommended) Typed hooks
// Instead of plain useDispatch/useSelector, use these:
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;