// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// YouTube API types
export interface YouTubeVideo {
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  channelTitle: string;
  viewCount?: number;
  likeCount?: number;
}

// Database model types
export interface Video {
  _id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  channelTitle: string;
  tags: string[];
  isLiked: boolean;
  isPinned: boolean;
  addedAt: string;
  watchCount: number;
  lastWatchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  videoIds: Video[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  videoId: Video;
  content: string;
  timestamp?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  _id: string;
  videoId: Video;
  watchedAt: string;
  duration: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchStats {
  period: string;
  totalWatchTime: number;
  totalSessions: number;
  uniqueVideosCount: number;
}