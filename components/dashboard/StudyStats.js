// components/StudyStats.js
import React from 'react';

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Create a new date object for Monday calculation to avoid mutating 'now'
  const mondayDate = new Date(now);
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  mondayDate.setDate(diff);
  mondayDate.setHours(0, 0, 0, 0);
  
  // Create Sunday from Monday
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);
  sundayDate.setHours(23, 59, 59, 999);
  
  return { monday: mondayDate, sunday: sundayDate };
};

const StudyStats = ({ recentSessions }) => {
  // Calculate statistics from recentSessions
  const calculateStats = () => {
    const { monday, sunday } = getCurrentWeekRange();
    
    console.log('Week range:', { monday, sunday }); // Debug log
    console.log('Recent sessions:', recentSessions); // Debug log
    
    // Filter sessions from current week (Monday to Sunday)
    const thisWeekSessions = recentSessions.filter(session => {
      const sessionDate = new Date(session.date);
      console.log('Session date:', sessionDate, 'In range:', sessionDate >= monday && sessionDate <= sunday); // Debug log
      return sessionDate >= monday && sessionDate <= sunday;
    });

    // Calculate total study time (in minutes)
    const totalStudyTime = recentSessions.reduce(
      (total, session) => total + session.duration, 0
    );

    // Calculate this week's study time (Monday to Sunday)
    const thisWeekStudyTime = thisWeekSessions.reduce(
      (total, session) => total + session.duration, 0
    );

    // Calculate daily average for current week days
    const daysPassedThisWeek = Math.min(new Date().getDay() || 7, 7); // 1-7
    const dailyAverage = daysPassedThisWeek > 0
      ? Math.round(thisWeekStudyTime / daysPassedThisWeek)
      : 0;

    // Count completed sessions
    const sessionsCompleted = recentSessions.length;

    return {
      totalStudyTime,
      thisWeekStudyTime,
      dailyAverage,
      sessionsCompleted
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 w-full lg:w-80 flex flex-col justify-center">
      <div className="text-white text-center mb-4">
        <div className="text-2xl font-bold">{formatMinutes(stats.totalStudyTime)}</div>
        <div className="text-sm opacity-80">Total Study Time</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/20 rounded-lg p-2 text-center">
          <div className="text-white font-bold">{formatMinutes(stats.thisWeekStudyTime)}</div>
          <div className="text-white text-xs opacity-80">This Week</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2 text-center">
          <div className="text-white font-bold">{formatMinutes(stats.dailyAverage)}</div>
          <div className="text-white text-xs opacity-80">Daily Avg</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2 text-center">
          <div className="text-white font-bold">{stats.sessionsCompleted}</div>
          <div className="text-white text-xs opacity-80">Sessions</div>
        </div>
      </div>
    </div>
  );
};

export default StudyStats;