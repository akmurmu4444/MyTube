# MyTube Backend

Personal YouTube-like web app backend with YouTube Data API v3 integration.

## Features

- **YouTube Integration**: Search and fetch video metadata using YouTube Data API v3
- **Personal Video Management**: Save, organize, and manage your video collection
- **Advanced Search**: Full-text search across video titles and descriptions
- **Playlists**: Create and manage custom playlists with drag-and-drop support
- **Notes System**: Add timestamped notes to videos with Markdown support
- **Watch History**: Track viewing history and generate statistics
- **Tag Management**: Organize videos with custom tags and topics
- **RESTful API**: Clean, well-documented API endpoints

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **External API**: YouTube Data API v3
- **Security**: Helmet, CORS, Rate limiting
- **Development**: Nodemon for hot reloading

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- YouTube Data API v3 key

### Installation

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mytube
   YOUTUBE_API_KEY=your_youtube_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

3. **Get YouTube API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Add the key to your `.env` file

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### YouTube Integration
- `GET /api/youtube/search?q=query` - Search YouTube videos
- `GET /api/youtube/video/:videoId` - Get video details
- `POST /api/youtube/search-by-tags` - Search by multiple tags

### Video Management
- `GET /api/videos` - Get all saved videos (with filtering)
- `POST /api/videos` - Save video from YouTube
- `PUT /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video
- `PATCH /api/videos/:id/like` - Toggle like status
- `PATCH /api/videos/:id/pin` - Toggle pin status

### Playlists
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id` - Get playlist details
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/videos` - Add video to playlist
- `DELETE /api/playlists/:id/videos/:videoId` - Remove video from playlist

### Notes
- `GET /api/notes` - Get all notes (filterable by video)
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### History & Analytics
- `GET /api/history` - Get watch history
- `POST /api/history` - Add history entry
- `GET /api/history/stats` - Get watch statistics
- `DELETE /api/history` - Clear history

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## Database Schema

### Video Model
```javascript
{
  youtubeId: String (unique),
  title: String,
  description: String,
  thumbnail: String,
  duration: String,
  publishedAt: Date,
  channelTitle: String,
  tags: [String],
  isLiked: Boolean,
  isPinned: Boolean,
  addedAt: Date,
  watchCount: Number,
  lastWatchedAt: Date
}
```

### Playlist Model
```javascript
{
  name: String,
  description: String,
  videoIds: [ObjectId],
  createdAt: Date
}
```

### Note Model
```javascript
{
  videoId: ObjectId,
  content: String,
  timestamp: Number,
  createdAt: Date
}
```

### History Model
```javascript
{
  videoId: ObjectId,
  watchedAt: Date,
  duration: Number,
  position: Number
}
```

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests

### Project Structure
```
backend/
├── src/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route handlers
│   ├── services/        # Business logic (YouTube API)
│   └── index.js         # App entry point
├── .env.example         # Environment template
└── package.json
```

## Deployment

### Environment Variables
Ensure all required environment variables are set:
- `MONGODB_URI` - MongoDB connection string
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `NODE_ENV=production`
- `PORT` - Server port (default: 5000)

### MongoDB Atlas Setup
1. Create cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create database user
3. Whitelist IP addresses
4. Get connection string and add to `MONGODB_URI`

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Centralized error handling

## API Rate Limits

- YouTube API: 10,000 units per day (default quota)
- Search operation: ~100 units per request
- Video details: ~1 unit per request

Monitor your quota usage in Google Cloud Console.