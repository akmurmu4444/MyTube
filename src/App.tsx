import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Watchlist from './pages/Watchlist';
import Liked from './pages/Liked';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Notes from './pages/Notes';
import History from './pages/History';
import Stats from './pages/Stats';
import VideoPlayer from './pages/VideoPlayer';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { useAppSelector, useAppDispatch } from './redux/store';
import { useEffect } from 'react';
import { getCurrentUser } from './redux/slices/authSlice';

function App() {
  const { isAuthenticated, token } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  // Initialize user session if token exists
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <ThemeProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* All other routes use Layout wrapper */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="video/:id" element={<VideoPlayer />} />
              
              {/* Protected routes */}
              <Route path="watchlist" element={
                <ProtectedRoute>
                  <Watchlist />
                </ProtectedRoute>
              } />
              <Route path="liked" element={
                <ProtectedRoute>
                  <Liked />
                </ProtectedRoute>
              } />
              <Route path="playlists" element={
                <ProtectedRoute>
                  <Playlists />
                </ProtectedRoute>
              } />
              <Route path="playlists/:id" element={
                <ProtectedRoute>
                  <PlaylistDetail />
                </ProtectedRoute>
              } />
              <Route path="notes" element={
                <ProtectedRoute>
                  <Notes />
                </ProtectedRoute>
              } />
              <Route path="history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="stats" element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;