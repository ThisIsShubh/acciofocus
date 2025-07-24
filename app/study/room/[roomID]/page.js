"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { FaChevronLeft, FaClock, FaImage, FaListUl, FaMusic, FaPause, FaPlay, FaPlus, FaRedo, FaStepForward, FaTimes, FaTrash, FaCheck, FaEdit, FaHome, FaVolumeUp, FaVolumeMute, FaYoutube, FaUserFriends, FaComments, FaCog, FaExpand, FaTrophy, FaBook } from "react-icons/fa";
import { getFormattedTime, getFormattedDate } from "../../../../helpers/format";
import { getYoutubeId } from "../../../../helpers/youtube";
import { usePomodoro } from "../../../../controllers/usePomodoro";
import { useMenu, useRightMenu } from "../../../../controllers/useMenu";
import { useBackground } from "../../../../controllers/useBackground";
import { useYoutube } from "../../../../controllers/useYoutube";
import { useAmbientSound } from "../../../../controllers/useAmbientSound";
import Timer from "../../../../components/Timer";
import TaskList from "../../../../components/TaskList";
import Background from "../../../../components/Background";
import AmbientAudio from "../../../../components/AmbientAudio";

// Constants for backgrounds and sounds
const staticBgOptions = [
  { key: "/staticBg/forest.png", label: "Forest" },
  { key: "/staticBg/cafe.png", label: "Cafe" },
  { key: "/staticBg/beach.png", label: "Beach" },
  { key: "/staticBg/city.png", label: "City" },
  { key: "/staticBg/desk.png", label: "Desk" },
  { key: "/staticBg/bookshelf.png", label: "Bookshelf" },
  { key: "/staticBg/rain.png", label: "Rainy Window" },
  { key: "/staticBg/stars.png", label: "Starry Night" },
  { key: "/staticBg/cherryblossom.png", label: "Cherry Blossom" },
  { key: "/staticBg/zengarden.png", label: "Zen Garden" },
  { key: "/staticBg/autumn.png", label: "Autumn" }
];
const dynamicBgOptions = [
  { key: "/dynamicBg/forest.mp4", label: "Forest Video" },
  { key: "/dynamicBg/fireplace.mp4", label: "Fireplace" },
  { key: "/dynamicBg/rainycafe.mp4", label: "Rainy Cafe" },
  { key: "/dynamicBg/beach.mp4", label: "Beach" },
  { key: "/dynamicBg/beachsunset.mp4", label: "Beach Sunset" },
  { key: "/dynamicBg/fairyforest.mp4", label: "Fairy Forest" },
  { key: "/dynamicBg/ocean.mp4", label: "Ocean" },
  { key: "/dynamicBg/rainycabin.mp4", label: "Rainy Cabin" },
  { key: "/dynamicBg/waterfall.mp4", label: "Waterfall" }
];
const sounds = ["rain", "cafe", "forest", "fireplace", "ocean", "piano"];
const soundNames = {
  rain: "Rainfall",
  cafe: "Coffee Shop",
  forest: "Forest",
  fireplace: "Fireplace",
  ocean: "Ocean",
  piano: "Piano"
};
const soundIcons = {
  rain: "🌧️",
  cafe: "☕",
  forest: "🌲",
  fireplace: "🔥",
  ocean: "🌊",
  piano: "🎹"
};

// Mock room users for presence and chat
const mockRoomUsers = [
  { id: 'u1', name: 'Alex', avatar: '/avatars/user1.jpg', status: 'focused', streak: 5, today: 120 },
  { id: 'u2', name: 'Sam', avatar: '/avatars/user2.jpg', status: 'break', streak: 3, today: 90 },
  { id: 'u3', name: 'Jamie', avatar: '/avatars/user3.jpg', status: 'afk', streak: 1, today: 30 },
];
const statusEmoji = { focused: '🧠', break: '☕', afk: '💤' };

export default function RoomStudyPage() {
  // Controllers/hooks
  const fullscreenRef = useRef(null);
  const tingRef = useRef(null);
  const {
    menuOpen, setMenuOpen, menuRef
  } = useMenu();
  const {
    rightMenuOpen, setRightMenuOpen, rightMenuRef
  } = useRightMenu();
  const {
    bg, setBg, bgTab, setBgTab
  } = useBackground();
  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState("default");
  const [isMuted, setIsMuted] = useState(false);
  const {
    youtubeUrl, setYoutubeUrl, youtubeBg, setYoutubeBg, youtubeVolume, setYoutubeVolume, youtubeIframeRef, prevYoutubeVolume
  } = useYoutube(isMuted);
  const {
    ambientVolumes, setAmbientVolumes, audioRefs
  } = useAmbientSound(isMuted);
  const {
    isRunning, setIsRunning, isBreak, setIsBreak, secondsLeft, setSecondsLeft,
    activeWorkDuration, setActiveWorkDuration, activeBreakDuration, setActiveBreakDuration,
    pendingWorkDuration, setPendingWorkDuration, pendingBreakDuration, setPendingBreakDuration,
    pendingReset, setPendingReset, progress, setProgress, focusUnits, setFocusUnits,
    skipSession, resetTimer
  } = usePomodoro();
  
  // Room state
  const [syncTimer, setSyncTimer] = useState(true);
  const [syncAmbient, setSyncAmbient] = useState(false);
  const [showMyTasks, setShowMyTasks] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { user: 'Alex', text: 'Let’s go team!', time: '09:00' },
    { user: 'Sam', text: 'Ready to focus!', time: '09:01' },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [focusBuddy, setFocusBuddy] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);

  // Add state for showing the recent/achievements panel and mock data at the top of the component:
  const mockRecentSessions = [
    { id: 1, subject: 'Math', date: '2024-06-01T09:00', duration: 60, focusScore: 90 },
    { id: 2, subject: 'Physics', date: '2024-06-01T11:00', duration: 45, focusScore: 80 },
    { id: 3, subject: 'Chemistry', date: '2024-05-31T15:00', duration: 50, focusScore: 85 },
  ];
  const mockAchievements = [
    { id: 1, title: 'First Group Session', description: 'Completed your first group study session!', earned: true },
    { id: 2, title: 'Focus Masters', description: 'Group focused for 3 hours in a day.', earned: false },
    { id: 3, title: 'Streak Team', description: 'Everyone kept a 5-day streak.', earned: false },
  ];

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Task handlers
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask.trim(), done: false }]);
      setNewTask("");
    }
  };
  const handleToggleTask = idx => {
    setTasks(tasks => tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  };
  const handleDeleteTask = idx => {
    setTasks(tasks => tasks.filter((_, i) => i !== idx));
  };
  const handleEditTask = idx => {
    setEditIdx(idx);
    setEditText(tasks[idx].text);
  };
  const handleSaveEdit = idx => {
    setTasks(tasks => tasks.map((t, i) => i === idx ? { ...t, text: editText } : t));
    setEditIdx(null);
    setEditText("");
  };
  const handleCancelEdit = () => {
    setEditIdx(null);
    setEditText("");
  };

  // Timer formatting
  const min = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const sec = String(secondsLeft % 60).padStart(2, "0");

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const el = fullscreenRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  };

  // Add keyboard shortcut for fullscreen (F or f)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Play ting sound at end of session
  useEffect(() => {
    if (isRunning && secondsLeft === 1 && tingRef.current) {
      tingRef.current.currentTime = 0;
      tingRef.current.volume = 1;
      tingRef.current.play();
    }
  }, [isRunning, secondsLeft]);

  // Helper to close all right panels
  const closeAllRightPanels = () => {
    setRightMenuOpen(false);
    setShowChat(false);
    setShowGroupPanel(false);
  };

  return (
    <div ref={fullscreenRef} className="w-screen h-screen min-h-0 min-w-0 overflow-hidden relative flex flex-col bg-gradient-to-br from-gray-900 to-slate-900">
      {/* Top Bar: Room title left, menu items right */}
      <div className="fixed top-4 left-0 right-0 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <h1 className="font-bold text-white text-lg md:text-2xl">Study Room: <span className="text-blue-300">Academic Focus</span></h1>
        </div>
        <div className="flex flex-row-reverse gap-4">
          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center"
            style={{ width: 48, height: 48 }}
          >
            <FaHome className="w-6 h-6" />
          </Link>
          <button
            className="bg-white/10 hover:bg-white/20 text-white/40 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center"
            style={{ width: 48, height: 48 }}
            onClick={() => {
              setIsMuted(muted => {
                if (!muted) prevYoutubeVolume.current = youtubeVolume;
                if (muted && youtubeVolume === 0 && prevYoutubeVolume.current > 0) {
                  setYoutubeVolume(prevYoutubeVolume.current);
                }
                return !muted;
              });
              if (!isMuted) setYoutubeVolume(0);
              if (isMuted && prevYoutubeVolume.current > 0) setYoutubeVolume(prevYoutubeVolume.current);
            }}
          >
            {isMuted ? <FaVolumeMute className="w-6 h-6" /> : <FaVolumeUp className="w-6 h-6" />}
          </button>
          <button
            className="bg-white/10 hover:bg-white/20 text-white/40 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center"
            style={{ width: 48, height: 48 }}
            onClick={() => setShowSettings(!showSettings)}
          >
            <FaCog className="w-6 h-6" />
          </button>
          <button
            className="bg-white/10 hover:bg-white/20 text-white/40 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center"
            style={{ width: 48, height: 48 }}
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <FaUserFriends className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-40 w-72 bg-slate-800 rounded-xl shadow-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold">Settings</h2>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setShowSettings(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input 
                  type="checkbox" 
                  checked={syncTimer} 
                  onChange={e => setSyncTimer(e.target.checked)} 
                  className="form-checkbox text-blue-500 rounded"
                />
                Sync Timer
              </label>
              
              <label className="flex items-center gap-2 text-gray-300">
                <input 
                  type="checkbox" 
                  checked={syncAmbient} 
                  onChange={e => setSyncAmbient(e.target.checked)} 
                  className="form-checkbox text-blue-500 rounded"
                />
                Sync Ambient Sound
              </label>
              
              <label className="flex items-center gap-2 text-gray-300">
                <input 
                  type="checkbox" 
                  checked={showMyTasks} 
                  onChange={e => setShowMyTasks(e.target.checked)} 
                  className="form-checkbox text-blue-500 rounded"
                />
                Share My Tasks
              </label>
            </div>
            
            <div className="pt-2 border-t border-slate-700">
              <label className="text-gray-300 text-sm mb-1 block">Focus Buddy</label>
              <select 
                className="w-full bg-slate-700 text-white rounded-lg p-2 text-sm"
                value={focusBuddy} 
                onChange={e => setFocusBuddy(e.target.value)}
              >
                <option value="">No Focus Buddy</option>
                {mockRoomUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute top-16 left-4 z-40 w-72 bg-slate-800 rounded-xl shadow-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold">Participants</h2>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setShowParticipants(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="space-y-3">
            {mockRoomUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="relative">
                  <img 
                    src={u.avatar} 
                    alt={u.name} 
                    className="w-10 h-10 rounded-full border-2 border-green-400" 
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                    u.status === 'focused' ? 'bg-green-500' : 
                    u.status === 'break' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-white">{u.name}</span>
                    <span className="text-xs text-gray-400">{u.today}m today</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-600 px-2 py-0.5 rounded-full text-white">
                      {statusEmoji[u.status]} {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                    <span className="text-xs bg-amber-900/50 px-2 py-0.5 rounded-full text-amber-300">
                      🔥 {u.streak} day streak
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Side Menu (contextual) */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-full z-30 transform transition-all duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full w-80 p-6 flex flex-col gap-8 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar" style={{ maxHeight: '100vh' }}>
          <div className="flex justify-start items-center mb-4">
            <button
              className="pr-2 rounded-full hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              <FaChevronLeft className="text-lg" />
            </button>
            <h2 className="text-xl font-bold capitalize">
              {menuOpen === 'timer' ? 'Timer Settings' : menuOpen === 'background' ? 'Background' : menuOpen === 'mixer' ? 'Ambient Mixer' : 'Settings'}
            </h2>
          </div>
          {/* Panel content */}
          {menuOpen === 'timer' && (
            <div className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Focus Duration</span>
                    <span className="font-mono">{pendingWorkDuration} min</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={pendingWorkDuration}
                    onChange={e => setPendingWorkDuration(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Break Duration</span>
                    <span className="font-mono">{pendingBreakDuration} min</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={pendingBreakDuration}
                    onChange={e => setPendingBreakDuration(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                {pendingReset && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className="text-xs text-red-600 font-semibold">Settings changed. Reset required to apply.</span>
                    <button
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-xs"
                      onClick={resetTimer}
                    >
                      Reset Timer
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-8 flex-shrink-0">
                <button
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 rounded-lg font-semibold text-sm transition-all shadow"
                  onClick={() => {
                    setIsRunning(false);
                    setIsBreak(false);
                    setSecondsLeft(pendingWorkDuration * 60);
                    setFocusUnits(0);
                    setPendingReset(false);
                  }}
                >
                  End Session
                </button>
              </div>
            </div>
          )}
          {menuOpen === 'background' && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaYoutube /> Youtube Player
                </h3>
                <div>
                  <input
                    type="text"
                    placeholder="Paste YouTube link..."
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    className="w-full flex-1 px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
                  />
                  <div className="flex gap-2 w-full mb-2">
                    <button
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                      onClick={() => {
                        if (getYoutubeId(youtubeUrl)) {
                          setYoutubeBg(youtubeUrl);
                        }
                      }}
                    >
                      Set
                    </button>
                    {youtubeBg && (
                      <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold text-xs"
                        onClick={() => setYoutubeBg("")}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {/* Dummy YouTube video options */}
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <button
                      className="w-full bg-white/70 hover:bg-green-100 text-green-900 px-3 py-2 rounded-lg font-medium text-xs border border-green-200"
                      onClick={() => setYoutubeBg('https://www.youtube.com/watch?v=lTRiuFIWV54')}
                    >
                      Lofi Hip Hop Radio
                    </button>
                    <button
                      className="w-full bg-white/70 hover:bg-green-100 text-green-900 px-3 py-2 rounded-lg font-medium text-xs border border-green-200"
                      onClick={() => setYoutubeBg('https://www.youtube.com/watch?v=0L38Z9hIi5s')}
                    >
                      Cozy Rainy Cafe
                    </button>
                    <button
                      className="w-full bg-white/70 hover:bg-green-100 text-green-900 px-3 py-2 rounded-lg font-medium text-xs border border-green-200"
                      onClick={() => setYoutubeBg('https://www.youtube.com/watch?v=29XymHesxa0')}
                    >
                      Nature Ambience
                    </button>
                  </div>
                  {youtubeBg && !getYoutubeId(youtubeBg) && (
                    <div className="text-xs text-red-600 mt-1">Invalid YouTube link</div>
                  )}
                  {youtubeBg && getYoutubeId(youtubeBg) && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-900 text-xs">YouTube Volume</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={youtubeVolume}
                        onChange={e => setYoutubeVolume(Number(e.target.value))}
                        className="accent-green-500 w-32"
                      />
                      <span className="text-green-900 text-xs w-8 text-right">{youtubeVolume}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaImage /> Backgrounds
                </h3>
                <div className="flex gap-2 mb-6">
                  <button
                    className={`px-6 py-2 rounded-full font-semibold transition-all shadow text-sm ${bgTab === 'static' ? 'bg-green-500 text-white' : 'bg-white/60 text-green-900 hover:bg-green-100'}`}
                    onClick={() => setBgTab('static')}
                  >
                    Static
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full font-semibold transition-all shadow text-sm ${bgTab === 'live' ? 'bg-green-500 text-white' : 'bg-white/60 text-green-900 hover:bg-green-100'}`}
                    onClick={() => setBgTab('live')}
                  >
                    Live
                  </button>
                </div>
                {bgTab === 'static' ? (
                  <div>
                    <div className="flex flex-col gap-2">
                      {staticBgOptions.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => { setBg(opt.key); setYoutubeBg(""); }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${bg === opt.key && !youtubeBg ? "bg-yellow-500 text-white font-semibold" : "bg-green-500/10 text-green-900 hover:bg-green-100"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col gap-2">
                      {dynamicBgOptions.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => { setBg(opt.key); setYoutubeBg(""); }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${bg === opt.key && !youtubeBg ? "bg-yellow-500 text-white font-semibold" : "bg-green-500/10 text-green-900 hover:bg-green-100"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {menuOpen === 'mixer' && (
            <div>
              <div className="space-y-4">
                {sounds.map((sound) => {
                  const isActive = ambientVolumes[sound] > 0;
                  return (
                    <div
                      key={sound}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isActive ? "bg-white" : ""}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="text-2xl w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg">
                          {soundIcons[sound]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-green-800 truncate">
                              {soundNames[sound]}
                            </span>
                            <span className="text-xs font-mono bg-green-500/10 px-2 py-0.5 rounded text-green-700">
                              {Math.round(ambientVolumes[sound] * 100)}%
                            </span>
                          </div>
              <div className="flex items-center gap-2">
                  <input 
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={ambientVolumes[sound]}
                              onChange={(e) =>
                                setAmbientVolumes((v) => ({
                                  ...v,
                                  [sound]: parseFloat(e.target.value),
                                }))
                              }
                              className="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
              </div>
            </div>
          </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
                  onClick={() => {
                    // Set all volumes to 0
                    const resetVolumes = sounds.reduce((acc, sound) => {
                      acc[sound] = 0;
                      return acc;
                    }, {});
                    setAmbientVolumes(resetVolumes);
                  }}
                >
                  <FaRedo className="text-xs" /> Reset all volumes
                </button>
              </div>
            </div>
          )}
          {/* Always-mounted audio elements for ambient sounds */}
          {sounds.map((sound) => (
            <audio
              key={sound}
              ref={el => (audioRefs.current[sound] = el)}
              src={`/sounds/${sound}.mp3`}
              preload="auto"
              style={{ display: 'none' }}
            />
          ))}
          </div>
        </div>

      {/* Left Menu Toggle Buttons - Responsive: row at top left on mobile, column at 1/4 on md+ */}
      {!menuOpen && (
        <div
          className="fixed z-40 flex gap-2 left-4 top-4 flex-row
          md:flex-col md:gap-4 md:left-4 md:top-1/2 md:-translate-y-1/2"
        >
          <button
            className="bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all"
            onClick={() => setMenuOpen('timer')}
            title="Timer Settings"
            style={{ width: 48, height: 48 }}
          >
            <FaClock className="w-6 h-6" />
          </button>
          <button
            className="bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all"
            onClick={() => setMenuOpen('background')}
            title="Background Settings"
            style={{ width: 48, height: 48 }}
          >
            <FaImage className="w-6 h-6" />
          </button>
          <button
            className="bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all"
            onClick={() => setMenuOpen('mixer')}
            title="Ambient Mixer"
            style={{ width: 48, height: 48 }}
          >
            <FaMusic className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex relative min-h-0">
        {/* Center Area */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          {/* Background Video/Image/YouTube */}
          <Background youtubeBg={youtubeBg} youtubeIframeRef={youtubeIframeRef} bg={bg} />
          
          {/* Ting sound for session end */}
          <audio ref={tingRef} src="/ting.mp3" preload="auto" />
          
          {/* Always-mounted audio elements for ambient sounds */}
          <AmbientAudio audioRefs={audioRefs} />
          
          {/* Timer Container */}
          {/* Centered Pomodoro Timer (copied from solo study page) */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            {/* Real time and date */}
            <div className="mb-8 text-center">
              <div className="text-2xl text-white font-medium tracking-wider">{getFormattedTime(now)}</div>
              <div className="text-white opacity-80">{getFormattedDate(now)}</div>
            </div>

            {/* Circular Progress Timer */}
            <Timer min={min} sec={sec} isBreak={isBreak} progress={progress} />

            {/* Timer Controls */}
            <div className="flex gap-4">
              {!isRunning ? (
                <button
                  className="px-8 py-3 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 transition flex items-center"
                  onClick={() => setIsRunning(true)}
                >
                  <FaPlay className="mr-2" /> Start
                </button>
              ) : (
                <button
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold shadow-lg hover:from-amber-600 hover:to-orange-600 transition flex items-center"
                  onClick={() => setIsRunning(false)}
                >
                  <FaPause className="mr-2" /> Pause
                </button>
              )}

              <button
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold shadow-lg transition flex items-center"
                onClick={skipSession}
              >
                <FaStepForward />
              </button>

              <button
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold shadow-lg transition flex items-center"
                onClick={resetTimer}
              >
                <FaRedo />
              </button>
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-6 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Focus: {activeWorkDuration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Break: {activeBreakDuration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-mono text-base">�� {focusUnits}</span>
                  <span className="text-xs text-green-200">Focus Units</span>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const activeSounds = sounds.filter(s => ambientVolumes[s] > 0.01);
                    const showSounds = activeSounds.slice(0, 2);
                    const extraCount = activeSounds.length - 2;
                    return (
                      <>
                        <div className="text-xl flex gap-1">
                          {showSounds.map(s => (
                            <span key={s}>{soundIcons[s]}</span>
                          ))}
                          {extraCount > 0 && (
                            <span className="text-base align-top ml-1"></span>
                          )}
                        </div>
                        <span>
                          {activeSounds.length === 0
                            ? "No Sound"
                            : showSounds.map(s => soundNames[s]).join(", ") + (extraCount > 0 ? ` +${extraCount}` : "")}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          {/* Removed bottom bar with chat, sound, and background buttons */}
        </div>
        
        {/* Chat Panel */}
      </div>

      {/* Right Menu Toggle Buttons - always visible except when their panel is open */}
      <div className="fixed z-50 right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-4" style={{pointerEvents: 'none'}}>
        {!rightMenuOpen && (
          <button 
            className="bg-white/10 hover:bg-white/20 text-white/50 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all group mb-0"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              borderTopLeftRadius: '1.5rem',
              borderBottomLeftRadius: '1.5rem',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              padding: '0.75rem 0.5rem',
              minHeight: '120px',
              minWidth: '44px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              pointerEvents: 'auto',
            }}
            onClick={() => { closeAllRightPanels(); setRightMenuOpen(true); }}
            title="Task List"
          >
            <span className="group-hover:scale-105 transition-transform" style={{color: 'inherit'}}>Tasks</span>
          </button>
        )}
        {!showChat && (
          <button 
            className="bg-white/10 hover:bg-white/20 text-white/70 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all group mb-0"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              borderTopLeftRadius: '1.5rem',
              borderBottomLeftRadius: '1.5rem',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              padding: '0.75rem 0.5rem',
              minHeight: '80px',
              minWidth: '44px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              pointerEvents: 'auto',
            }}
            onClick={() => { closeAllRightPanels(); setShowChat(true); }}
            title="Room Chat"
          >
            <span className="group-hover:scale-105 transition-transform" style={{color: 'inherit'}}>Chat</span>
          </button>
        )}
        {!showGroupPanel && (
          <button 
            className="bg-white/10 hover:bg-white/20 text-white/70 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all group mb-0"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              borderTopLeftRadius: '1.5rem',
              borderBottomLeftRadius: '1.5rem',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              padding: '0.75rem 0.5rem',
              minHeight: '80px',
              minWidth: '44px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              pointerEvents: 'auto',
            }}
            onClick={() => { closeAllRightPanels(); setShowGroupPanel(true); }}
            title="Group Sessions & Achievements"
          >
            <span className="group-hover:scale-105 transition-transform" style={{color: 'inherit'}}>Group</span>
          </button>
        )}
      </div>

      {/* Right Floating Tasks Menu */}
      <div
        ref={rightMenuRef}
        className={`fixed top-0 right-0 h-full z-80 transform transition-all duration-300 ease-in-out ${rightMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div
          className="h-full w-80 p-6 flex flex-col gap-6 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar shadow-2xl"
          style={{ maxHeight: '100vh' }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Room Tasks</h2>
            <button 
              className="p-2 rounded-full hover:bg-black/10"
              onClick={closeAllRightPanels}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          {/* Toggle between My Tasks and Room Tasks */}
          <div className="flex gap-2 mb-4">
            <button 
              className={`flex-1 px-4 py-2 rounded-full font-semibold transition-all shadow text-sm ${showMyTasks ? 'bg-green-500 text-white' : 'bg-white/60 text-green-900 hover:bg-green-100'}`}
              onClick={() => setShowMyTasks(true)}
            >
              My Tasks
            </button>
            <button 
              className={`flex-1 px-4 py-2 rounded-full font-semibold transition-all shadow text-sm ${!showMyTasks ? 'bg-green-500 text-white' : 'bg-white/60 text-green-900 hover:bg-green-100'}`}
              onClick={() => setShowMyTasks(false)}
            >
              Room Tasks
            </button>
          </div>
          {/* Task input form and list */}
          {showMyTasks ? (
            <TaskList
              tasks={tasks}
              newTask={newTask}
              editIdx={editIdx}
              editText={editText}
              setNewTask={setNewTask}
              handleAddTask={handleAddTask}
              handleToggleTask={handleToggleTask}
              handleDeleteTask={handleDeleteTask}
              handleEditTask={handleEditTask}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              setEditText={setEditText}
            />
          ) : (
            <div className="space-y-4">
              {mockRoomUsers.map(user => (
                <div key={user.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border-2 border-green-400" />
                    <span className="font-semibold text-green-900">{user.name}</span>
                  </div>
                  {/* Mock tasks for each user */}
                  <div className="space-y-2 ml-8">
                    {/* Replace with real shared tasks if available */}
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={false} readOnly className="form-checkbox text-green-500" />
                      <span className="text-gray-700">Sample task 1 for {user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={true} readOnly className="form-checkbox text-green-500" />
                      <span className="text-gray-400 line-through">Completed task for {user.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Floating Chat Menu */}
      <div
        className={`fixed top-0 right-0 h-full z-90 transform transition-all duration-300 ease-in-out ${showChat ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: 320, maxWidth: '100vw' }}
      >
        <div className="h-full w-80 p-6 flex flex-col gap-6 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar shadow-2xl rounded-l-2xl border-l border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Room Chat</h2>
            <button className="p-2 rounded-full hover:bg-black/10" onClick={closeAllRightPanels}>
              <FaTimes className="text-lg" />
            </button>
          </div>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg ${
                msg.user === 'You' ? 'bg-blue-900/30 border-l-4 border-blue-500' : 'bg-slate-700/50'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`font-bold ${
                    msg.user === 'You' ? 'text-blue-300' : 'text-green-300'
                  }`}>{msg.user}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <p className="text-black text-sm mt-1">{msg.text}</p>
              </div>
            ))}
          </div>
          {/* Chat input */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter' && chatInput.trim()) { 
                    setChatMessages([...chatMessages, { 
                      user: 'You', 
                      text: chatInput, 
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    }]); 
                    setChatInput(''); 
                  } 
                }}
                disabled={chatDisabled}
                placeholder={chatDisabled ? 'Chat disabled' : 'Type a message...'}
              />
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
                disabled={chatDisabled || !chatInput.trim()} 
                onClick={() => { 
                  setChatMessages([...chatMessages, { 
                    user: 'You', 
                    text: chatInput, 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  }]); 
                  setChatInput(''); 
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Floating Group Sessions & Achievements Menu */}
      <div
        className={`fixed top-0 right-0 h-full z-90 transform transition-all duration-300 ease-in-out ${showGroupPanel ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: 320, maxWidth: '100vw' }}
      >
        <div
          className="h-full w-80 p-6 flex flex-col gap-6 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar shadow-2xl rounded-l-2xl border-l border-gray-200"
          style={{ maxHeight: '100vh' }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Group Sessions</h2>
            <button className="p-2 rounded-full hover:bg-black/10" onClick={closeAllRightPanels}>
              <FaTimes className="text-lg" />
            </button>
          </div>
          <div className="mb-4">
            {mockRecentSessions.length === 0 ? (
              <div className="text-gray-400 text-sm">No recent sessions</div>
            ) : (
              <div className="space-y-3">
                {mockRecentSessions.map(session => (
                  <div key={session.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-blue-600">
                      <FaBook size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">{session.subject}</span>
                        <span className="text-xs text-gray-500">{getFormattedDate(new Date(session.date))}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span className="mr-3">Duration: {session.duration} min</span>
                        <span className="mr-1">Focus:</span>
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${session.focusScore}%` }}></div>
                        </div>
                        <span className="ml-1">{session.focusScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Achievements</h2>
            <div className="space-y-3">
              {mockAchievements.map(ach => (
                <div key={ach.id} className={`border rounded-xl p-3 flex flex-col ${ach.earned ? 'border-amber-300 bg-amber-50' : 'border-gray-200 opacity-70'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <FaTrophy className={`text-lg ${ach.earned ? 'text-amber-500' : 'text-gray-400'}`} />
                    <span className="font-semibold text-gray-800">{ach.title}</span>
          </div>
                  <span className="text-sm text-gray-600">{ach.description}</span>
                  {ach.earned ? (
                    <span className="text-xs text-amber-600 font-medium mt-1">Earned</span>
                  ) : (
                    <span className="text-xs text-gray-500 mt-1">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}