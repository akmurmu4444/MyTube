import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  Heart, 
  List, 
  StickyNote, 
  History, 
  BarChart3,
  X,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const { isDark } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/watchlist', icon: Clock, label: 'Watchlist' },
    { path: '/liked', icon: Heart, label: 'Liked' },
    { path: '/playlists', icon: List, label: 'Playlists' },
    { path: '/notes', icon: StickyNote, label: 'Notes' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-screen lg:relative lg:z-auto transform transition-all duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col flex-shrink-0
      `}>
        {/* Header */}
        <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 min-h-[64px] ${
          isCollapsed ? 'lg:justify-center' : 'justify-between'
        }`}>
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:justify-center lg:space-x-0' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MT</span>
            </div>
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">MyTube</h2>
            )}
          </div>
          
          {/* Mobile close button */}
          {!isCollapsed && (
            <>
              {/* Mobile close button */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Desktop collapse button */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </>
          )}
          
          {/* Collapsed expand button */}
          {isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:block absolute top-4 right-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="px-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => isOpen && onClose()}
                title={isCollapsed ? label : ''}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isCollapsed ? 'lg:justify-center' : 'space-x-3'}
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;