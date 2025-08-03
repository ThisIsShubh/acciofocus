"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { FaClock, FaBook, FaEllipsisV, FaSpinner, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const RecentSessions = () => {
  const { user, isLoaded } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const maxVisibleSessions = 3; // Show 4 sessions by default

  // Fetch sessions when component mounts and user is available
  useEffect(() => {
    if (isLoaded && user) {
      fetchSessions();
    }
  }, [isLoaded, user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/sessions');

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format duration from minutes to readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 2) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get background label from path
  const getBackgroundLabel = (bgPath) => {
    if (!bgPath) return 'Default';

    if (bgPath.includes('youtube.com')) return 'YouTube';

    const filename = bgPath.split('/').pop();
    const name = filename.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Get sound icons
  const getSoundIcons = (sounds) => {
    const soundIcons = {
      rain: "🌧",
      cafe: "☕", 
      forest: "🌲",
      fireplace: "🔥",
      ocean: "🌊",
      piano: "🎹"
    };

    return sounds.map(sound => soundIcons[sound] || "🔊").join(" ");
  };

  // Calculate sessions to show
  const displayedSessions = expanded ? sessions : sessions.slice(0, maxVisibleSessions);

  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
            <FaClock className="text-blue-500" /> Recent Sessions
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-gray-400 text-2xl" />
          <span className="ml-3 text-gray-500">Loading sessions...</span>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
            <FaClock className="text-blue-500" /> Recent Sessions
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <FaBook className="text-4xl mb-3 mx-auto opacity-50" />
          <p>Sign in to track your study sessions</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
            <FaClock className="text-blue-500" /> Recent Sessions
          </h2>
        </div>
        <div className="text-center py-8 text-red-500">
          <FaExclamationTriangle className="text-4xl mb-3 mx-auto" />
          <p>Failed to load sessions</p>
          <button 
            onClick={fetchSessions}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
            <FaClock className="text-blue-500" /> Recent Sessions
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <FaBook className="text-4xl mb-3 mx-auto opacity-50" />
          <p>No study sessions yet</p>
          <p className="text-sm mt-1">Start your first session to see it here!</p>
        </div>
      </div>
    );
  }

  // Main render with sessions
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
          <FaClock className="text-blue-500" /> Recent Sessions
        </h2>
        <button 
          onClick={fetchSessions}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
          title="Refresh"
        >
          <FaEllipsisV />
        </button>
      </div>
      
      <div className="space-y-4">
        {displayedSessions.map(session => (
          <div key={session.id} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition">
            <div className="mr-3 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <FaBook size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-700 truncate">
                  {session.subject || 'General Study'}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDateTime(session.date)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <FaClock size={10} />
                  <span>Duration: {formatDuration(session.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Focus Units: {session.focusScore}</span>
                </div>
                {session.environment?.background && (
                  <div className="flex items-center gap-1">
                    <span>Background: {getBackgroundLabel(session.environment.background)}</span>
                  </div>
                )}
                {session.environment?.sounds && session.environment.sounds.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span>Sounds: {getSoundIcons(session.environment.sounds)}</span>
                  </div>
                )}
              </div>
              {/* Environment details - collapsible */}
              <div className="mt-2">
                <details className="text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-600 transition">
                    Environment Details
                  </summary>
                  <div className="mt-1 pl-2 border-l-2 border-gray-200">
                    <p><span className="font-medium">Mode:</span> {session.environment?.mode || 'Solo'}</p>
                    <p><span className="font-medium">Room:</span> {session.environment?.roomName || 'Solo Study'}</p>
                    {session.environment?.sounds && session.environment.sounds.length > 0 && (
                      <p><span className="font-medium">Active Sounds:</span> {session.environment.sounds.join(', ')}</p>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length > maxVisibleSessions && (
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-center w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mt-2"
        >
          {expanded ? (
            <>
              <FaChevronUp className="mr-2" />
              Show Less
            </>
          ) : (
            <>
              <FaChevronDown className="mr-2" />
              Show All ({sessions.length})
            </>
          )}
        </button>
      )}

      {sessions.length >= 10 && (
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">Showing {expanded ? 'all' : maxVisibleSessions} of 10 most recent sessions</p>
        </div>
      )}
    </div>
  );
};

export default RecentSessions;