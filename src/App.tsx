import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
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
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="liked" element={<Liked />} />
                <Route path="playlists" element={<Playlists />} />
                <Route path="playlists/:id" element={<PlaylistDetail />} />
                <Route path="notes" element={<Notes />} />
                <Route path="history" element={<History />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;