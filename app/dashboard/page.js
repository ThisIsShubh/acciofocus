// app/dashboard/page.js
'use client';
import React, { useState, useRef } from 'react';
import { FaCrown, FaCheckCircle, FaTrophy, FaUserFriends, FaStar, FaFire, FaBook, FaClock, FaChartLine, FaTasks, FaMedal, FaUsers, FaDoorOpen, FaEllipsisV, FaPlus } from 'react-icons/fa';
import { userData } from '@/data/user';
import Navbar from '@/components/navbar';

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const { profile, stats, goals, recentSessions, tasks, friends, achievements, studyRooms } = userData;
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for task completion
  const [taskList, setTaskList] = useState(tasks);
  
  // State for goal progress
  const [goalList, setGoalList] = useState(goals);
  
  // State for achievement filter
  const [achievementFilter, setAchievementFilter] = useState('all');

  // Toggle task completion
  const toggleTaskCompletion = (id) => {
    setTaskList(taskList.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Add new goal
  const addNewGoal = () => {
    const newGoal = {
      id: `goal_${goalList.length + 1}`,
      title: "New Study Goal",
      description: "Set your goal description",
      targetHours: 10,
      completedHours: 0,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "in-progress",
      category: "General"
    };
    setGoalList([...goalList, newGoal]);
  };

  // Filter achievements
  const filteredAchievements = achievementFilter === 'all' 
    ? achievements 
    : achievements.filter(a => achievementFilter === 'earned' ? a.earned : !a.earned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex-1">
            <div className="flex items-start gap-6">
              <div className="relative">
                <img 
                  src={profile.avatar} 
                  alt="avatar" 
                  className="w-20 h-20 rounded-full border-4 border-green-400 shadow-md" 
                />
                <div className="absolute -top-1 -right-1 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{profile.level}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <FaFire className="mr-1 text-orange-500" /> {profile.streak} day streak
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      XP: {profile.xp}/{profile.nextLevelXp}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{profile.bio}</p>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="font-medium">Joined:</span>
                    <span className="ml-1">{formatDate(profile.joinDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Last Active:</span>
                    <span className="ml-1">{formatDateTime(profile.lastActive)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Email:</span>
                    <span className="ml-1">{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 w-full lg:w-80 flex flex-col justify-center">
            <div className="text-white text-center mb-4">
              <div className="text-2xl font-bold">{formatMinutes(stats.totalStudyTime)}</div>
              <div className="text-sm opacity-80">Total Study Time</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-lg p-2 text-center">
                <div className="text-white font-bold">{formatMinutes(stats.weeklyStudyTime)}</div>
                <div className="text-white text-xs opacity-80">Weekly</div>
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
              className={`flex-1 px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'goals' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-green-100'}`}
              onClick={() => setActiveTab('goals')}
            >
              Goals
            </button>
            <button
              className={`flex-1 px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'community' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-green-100'}`}
              onClick={() => setActiveTab('community')}
            >
              Community
            </button>
            <button
              className={`flex-1 px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'achievements' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-green-100'}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
          </div>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaTasks className="text-pink-500" /> Tasks
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>
              
              <div className="space-y-4">
                {taskList.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-start p-3 rounded-lg ${task.completed ? 'bg-green-50' : 'bg-gray-50'}`}
                  >
                    <button 
                      className={`mr-3 mt-1 w-5 h-5 flex items-center justify-center rounded-full border ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      {task.completed && <FaCheckCircle size={12} />}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span>Due: {formatDate(task.dueDate)}</span> • 
                        <span> Subject: {task.subject}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Sessions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaClock className="text-blue-500" /> Recent Sessions
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentSessions.map(session => (
                  <div key={session.id} className="flex items-start p-3 bg-green-50 rounded-lg">
                    <div className="mr-3 mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-blue-600">
                      <FaBook size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">{session.subject}</span>
                        <span className="text-xs text-gray-500">{formatDateTime(session.date)}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span className="mr-3">Duration: {formatMinutes(session.duration)}</span>
                        <div className="flex items-center">
                          <span className="mr-1">Focus:</span>
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${session.focusScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-1">{session.focusScore}%</span>
                        </div>
                      </div>
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
          </div>
        )}
        
        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' : 
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
                        className={`h-full rounded-full ${
                          goal.completedHours / goal.targetHours > 0.75 ? 'bg-green-500' :
                          goal.completedHours / goal.targetHours > 0.5 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} 
                        style={{ width: `${Math.round((goal.completedHours / goal.targetHours) * 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-right text-xs text-gray-500">
                      {Math.round((goal.completedHours / goal.targetHours) * 100)}% Complete
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <FaChartLine className="text-green-500" /> Study Progress
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Weekly Focus</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-end h-24 gap-2">
                    {stats.productivityTrend.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-green-400 rounded-t-md hover:bg-green-500 transition-colors"
                          style={{ height: `${(day.minutes / 180) * 100}%` }}
                          title={`${day.minutes} minutes on ${formatDate(day.date)}`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(day.date).split(' ')[1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Subject Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats.subjects).map(([subject, minutes]) => (
                    <div key={subject} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600 truncate">{subject}</div>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden mx-2">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                          style={{ width: `${(minutes / stats.totalStudyTime) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-right text-sm text-gray-700">
                        {formatMinutes(minutes)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                        <img 
                          src={friend.avatar} 
                          alt={friend.name} 
                          className="w-12 h-12 rounded-full border-2 border-green-300" 
                        />
                        <div 
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
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
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
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
                  className={`border rounded-xl p-4 flex flex-col items-center text-center ${
                    achievement.earned ? 'border-amber-300 bg-amber-50' : 'border-gray-200 opacity-70'
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
        )}
      </div>
    </div>
  );
}