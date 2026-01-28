// app/dashboard/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { FaCrown, FaCheckCircle, FaTrophy, FaUserFriends, FaStar, FaFire, FaBook, FaClock, FaChartLine, FaTasks, FaMedal, FaUsers, FaDoorOpen, FaEllipsisV, FaPlus } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import Navbar from '@/components/navbar';
import Image from 'next/image';

import TasksSection from '@/components/dashboard/Tasks';
import RecentSessions from '@/components/dashboard/Sessions';
import StudyStats from '@/components/dashboard/StudyStats';
import PageLoader from '@/components/Loader';
import Profile from '@/components/dashboard/Profile';

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeeklyData(trendData = []) {
  const days = [];
  const today = new Date();

  // Create array for last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    // Find matching data
    const existingDay = trendData.find(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === d.getTime();
    });

    days.push({
      date: d.toISOString(),
      minutes: existingDay ? existingDay.minutes : 0
    });
  }
  return days;
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  // State for task completion
  const [taskList, setTaskList] = useState([]);
  // State for goal progress
  const [goalList, setGoalList] = useState([]);
  // State for achievement filter
  const [achievementFilter, setAchievementFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== Dashboard: Starting to fetch user data ===');
        console.log('Fetching user data from /api/user/me...');

        const res = await fetch('/api/user/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Response received from /api/user/me', res);
        console.log('Response status:', res.status);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
          const errorData = await res.json();
          console.error('API Error:', errorData);
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.error || 'Unknown error'}`);
        }

        const data = await res.json();
        console.log('User data received:', data);
        console.log('Goals data:', data.goals);
        console.log('Stats data:', data.stats);
        setUser(data);
        setTaskList(data.tasks || []);
        setGoalList(data.goals || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <PageLoader
      message="Loading your dashboard..."
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center"
    />
  );

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-gray-500 text-6xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No User Data Found</h2>
        <p className="text-gray-600 mb-4">Unable to load your profile information. Please try refreshing the page or contact support.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

  // Safely destructure with default values
  const stats = user.stats || {
    totalStudyTime: 0,
    weeklyStudyTime: 0,
    dailyAverage: 0,
    sessionsCompleted: 0,
    focusRate: 0,
    subjects: {},
    productivityTrend: []
  };
  const goals = user.goals || [];
  const recentSessions = user.recentSessions || [];
  const tasks = user.tasks || [];
  const friends = user.friends || [];
  const achievements = user.achievements || [];
  const studyRooms = user.studyRooms || [];

  // Add new goal
  const addNewGoal = () => {
    const newGoal = {
      id: `goal_${goalList.length + 1}`,
      title: 'New Study Goal',
      description: 'Set your goal description',
      targetHours: 10,
      completedHours: 0,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'in-progress',
      category: 'General',
    };
    setGoalList([...goalList, newGoal]);
  };

  // Filter achievements
  const filteredAchievements = achievementFilter === 'all'
    ? achievements
    : achievements.filter(a => achievementFilter === 'earned' ? a.earned : !a.earned);
  console.log("chadalmod :              ===============================================", user.profile);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 pt-18 md:pt-24 pb-12">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex-1">
            <Profile
              profile={user.profile}
              onEditBio={bio => setUser(prev => ({ ...prev, profile: { ...prev.profile, bio } }))}
            />
          </div>
          <StudyStats recentSessions={user.recentSessions} />
        </div>
        {/* Dashboard Tabs */}
        {/* Capsule Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-green-100 rounded-full shadow-inner p-1 gap-1 w-full max-w-xl">
            <button
              className={`flex-1 px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'overview' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-green-100'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`flex-1 px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'stats' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-green-100'}`}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
            <button
              className={`flex-1 px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'community' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-green-100'}`}
              onClick={() => setActiveTab('community')}
            >
              Community
            </button>
            {/* <button
              className={`flex-1 px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'achievements' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-green-100'}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button> */}
          </div>
        </div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks Section */}
            <TasksSection taskList={taskList} setTaskList={setTaskList} />
            {/* Study Goals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaStar className="text-purple-500" /> Study Goals
                </h2>
                <button
                  className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                  onClick={addNewGoal}
                >
                  <FaPlus size={12} /> Add Goal
                </button>
              </div>
              <div className="space-y-5">
                {goalList.map(goal => (
                  <div
                    key={goal.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                        }`}>
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <span className="font-medium">Category:</span>
                        <span className="ml-1">{goal.category}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Deadline:</span>
                        <span className="ml-1">{formatDate(goal.deadline)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Progress:</span>
                        <span className="ml-1">{goal.completedHours}h / {goal.targetHours}h</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
                      <div
                        className={`h-full rounded-full ${(goal.completedHours || 0) / (goal.targetHours || 1) > 0.75 ? 'bg-green-500' :
                          (goal.completedHours || 0) / (goal.targetHours || 1) > 0.5 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                        style={{ width: `${Math.round(((goal.completedHours || 0) / (goal.targetHours || 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {Math.round(((goal.completedHours || 0) / (goal.targetHours || 1)) * 100)}% Complete
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Study Rooms */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaUsers className="text-indigo-500" /> Study Rooms
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {studyRooms.map(room => (
                  <div
                    key={room.id}
                    className={`border rounded-xl p-4 flex flex-col ${room.favorite ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{room.name}</h3>
                      {room.favorite && <FaStar className="text-yellow-400" />}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FaUserFriends className="mr-1" size={12} />
                      <span>{room.participants} participants</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      <div>Last active: {formatDateTime(room.lastActive)}</div>
                      <div>Sessions: {room.totalSessions}</div>
                    </div>
                    <button className="mt-auto w-full py-2 text-sm rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors flex items-center justify-center">
                      <FaDoorOpen className="mr-2" /> Join Room
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Achievements Section */}
            <div className="bg-white w-full lg:col-span-2 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaTrophy className="text-amber-500" /> Achievements
                </h2>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 text-sm rounded-lg ${achievementFilter === 'all' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'}`}
                    onClick={() => setAchievementFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-lg ${achievementFilter === 'earned' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'}`}
                    onClick={() => setAchievementFilter('earned')}
                  >
                    Earned
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-lg ${achievementFilter === 'locked' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'}`}
                    onClick={() => setAchievementFilter('locked')}
                  >
                    Locked
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`border rounded-xl p-4 flex flex-col items-center text-center ${achievement.earned ? 'border-amber-300 bg-amber-50' : 'border-gray-200 opacity-70'
                      }`}
                  >
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-800 mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    {achievement.earned ? (
                      <div className="text-xs text-amber-600 font-medium">
                        Earned on {formatDate(achievement.dateEarned)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">Not yet earned</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sessions */}
            <RecentSessions />

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaChartLine className="text-green-500" /> Study Progress
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>

              {/* Empty State */}
              {!stats.totalStudyTime ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
                  <FaChartLine size={48} className="mb-3 opacity-50" />
                  <p className="font-medium">No study data yet</p>
                  <p className="text-sm">Complete your first session to see insights!</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                      Weekly Focus
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Last 7 Days</span>
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getWeeklyData(stats.productivityTrend)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            hide={false}
                            fontSize={12}
                            tickSize={0}
                            axisLine={false}
                            tick={{ fill: '#9CA3AF' }}
                            width={30}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                            formatter={(value) => [`${value} mins`, 'Study Time']}
                            cursor={{ fill: '#F3F4F6', radius: 4 }}
                          />
                          <Bar
                            dataKey="minutes"
                            fill="#4ade80"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                            activeBar={{ fill: '#22c55e' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Subject Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="w-full md:w-1/2 h-56 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(stats.subjects || {}).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {Object.entries(stats.subjects || {}).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={[
                                  '#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#818cf8', '#34d399'
                                ][index % 7]} strokeWidth={0} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                              formatter={(value) => [`${value} mins`, 'Duration']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
                          <span className="text-xl font-bold text-gray-700">{formatMinutes(stats.totalStudyTime)}</span>
                        </div>
                      </div>

                      {/* Custom Legend */}
                      <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0 pl-0 md:pl-6">
                        {Object.entries(stats.subjects || {})
                          .sort(([, a], [, b]) => b - a) // Sort by time descending
                          .slice(0, 5) // Top 5
                          .map(([subject, minutes], index) => {
                            const percentage = Math.round((minutes / (stats.totalStudyTime || 1)) * 100);
                            return (
                              <div key={subject} className="flex items-center justify-between text-sm group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#818cf8', '#34d399'][index % 7] }}
                                  ></div>
                                  <span className="font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">{subject}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 text-xs text-right">
                                  <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">{percentage}%</span>
                                  <span className="w-16 tabular-nums">{formatMinutes(minutes)}</span>
                                </div>
                              </div>
                            );
                          })}
                        {Object.keys(stats.subjects || {}).length > 5 && (
                          <div className="text-center text-xs text-gray-400 mt-2 italic">
                            + {Object.keys(stats.subjects).length - 5} more subjects
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaUserFriends className="text-green-500" /> Study Friends
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="relative">
                        <Image
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full border-2 border-green-300"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                        ></div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">{friend.name}</h3>
                          {friend.studying && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Studying
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{friend.currentActivity}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <div className="flex items-center mr-3">
                            <FaClock className="mr-1" size={10} />
                            <span>{formatMinutes(friend.weeklyStudyTime)}/wk</span>
                          </div>
                          <div className="flex items-center">
                            <FaFire className="mr-1 text-orange-500" size={10} />
                            <span>{friend.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="mt-3 w-full py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaUsers className="text-indigo-500" /> Group Study
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-indigo-800">Create Study Room</h3>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FaPlus />
                    </div>
                  </div>
                  <p className="text-sm text-indigo-700 mb-3">
                    Start a new study session and invite friends to join you
                  </p>
                  <button className="w-full py-2 text-sm rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                    Create Room
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Active Study Rooms</h3>
                  <div className="space-y-3">
                    {studyRooms.slice(0, 3).map(room => (
                      <div key={room.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <FaUsers />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{room.name}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <FaUserFriends className="mr-1" size={10} />
                            <span>{room.participants} participants</span>
                          </div>
                        </div>
                        <button className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors">
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Achievements Tab */}
      </div>
    </div>
  );
}