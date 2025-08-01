import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { BarChart3, Clock, Video, Heart, List, Calendar, TrendingUp } from 'lucide-react';
import { format, startOfDay, eachDayOfInterval, subDays, startOfWeek, startOfMonth } from 'date-fns';

const Stats: React.FC = () => {
  const { videos, liked } = useSelector((state: RootState) => state.videos);
  const { playlists } = useSelector((state: RootState) => state.playlists);
  const { history, totalWatchTime } = useSelector((state: RootState) => state.history);
  const { notes } = useSelector((state: RootState) => state.notes);
  const { tags } = useSelector((state: RootState) => state.tags);

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const weekAgo = startOfDay(subDays(now, 7));
    const monthAgo = startOfDay(subDays(now, 30));

    // Time-based stats
    const todayWatchTime = history
      .filter(entry => new Date(entry.watchedAt) >= today)
      .reduce((total, entry) => total + entry.duration, 0);

    const weekWatchTime = history
      .filter(entry => new Date(entry.watchedAt) >= weekAgo)
      .reduce((total, entry) => total + entry.duration, 0);

    const monthWatchTime = history
      .filter(entry => new Date(entry.watchedAt) >= monthAgo)
      .reduce((total, entry) => total + entry.duration, 0);

    // Most watched videos
    const videoWatchCounts = videos.map(video => ({
      ...video,
      watchCount: history.filter(entry => entry.videoId === video.id).length
    })).sort((a, b) => b.watchCount - a.watchCount);

    // Tag usage
    const tagCounts = videos.reduce((acc, video) => {
      video.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Daily activity for the last 7 days
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now
    });

    const dailyActivity = last7Days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayHistory = history.filter(entry => {
        const entryDate = new Date(entry.watchedAt);
        return entryDate >= dayStart && entryDate < dayEnd;
      });

      return {
        date: format(day, 'MMM dd'),
        watchTime: dayHistory.reduce((total, entry) => total + entry.duration, 0) / 60, // in minutes
        videosWatched: new Set(dayHistory.map(entry => entry.videoId)).size
      };
    });

    return {
      totalVideos: videos.length,
      totalLiked: liked.length,
      totalPlaylists: playlists.length,
      totalNotes: notes.length,
      totalTags: tags.length,
      totalWatchTime,
      todayWatchTime,
      weekWatchTime,
      monthWatchTime,
      mostWatchedVideos: videoWatchCounts.slice(0, 5),
      topTags,
      dailyActivity,
      averageDailyWatchTime: weekWatchTime / 7 / 60 // in minutes
    };
  }, [videos, history, totalWatchTime, liked, playlists, notes, tags]);

  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your video watching insights and analytics
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          title="Total Videos"
          value={stats.totalVideos}
          color="blue"
        />
        <StatCard
          icon={<Heart className="w-5 h-5 text-red-600 dark:text-red-400" />}
          title="Liked Videos"
          value={stats.totalLiked}
          color="red"
        />
        <StatCard
          icon={<List className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          title="Playlists"
          value={stats.totalPlaylists}
          color="purple"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-green-600 dark:text-green-400" />}
          title="Total Watch Time"
          value={formatWatchTime(stats.totalWatchTime)}
          color="green"
        />
      </div>

      {/* Watch Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
          title="Today"
          value={formatWatchTime(stats.todayWatchTime)}
          subtitle="Watch time today"
          color="orange"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          title="This Week"
          value={formatWatchTime(stats.weekWatchTime)}
          subtitle={`Avg: ${stats.averageDailyWatchTime.toFixed(0)}m/day`}
          color="indigo"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          title="This Month"
          value={formatWatchTime(stats.monthWatchTime)}
          subtitle="Last 30 days"
          color="teal"
        />
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Activity (Last 7 Days)
        </h3>
        <div className="grid grid-cols-7 gap-4">
          {stats.dailyActivity.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {day.date}
              </div>
              <div className="relative h-24 bg-gray-100 dark:bg-gray-700 rounded">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded"
                  style={{
                    height: `${Math.max((day.watchTime / 120) * 100, 2)}%` // Max 2 hours scale
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {Math.round(day.watchTime)}m
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Watched Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Most Watched Videos
          </h3>
          {stats.mostWatchedVideos.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No watch history yet</p>
          ) : (
            <div className="space-y-3">
              {stats.mostWatchedVideos.map((video, index) => (
                <div key={video.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {video.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {video.watchCount} view{video.watchCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Most Popular Tags
          </h3>
          {stats.topTags.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No tags yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topTags.map(([tag, count], index) => (
                <div key={tag} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tag}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.max((count / stats.totalVideos) * 100, 10)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;