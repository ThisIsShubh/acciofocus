"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  FaChevronLeft, FaClock, FaImage, FaListUl, FaMusic, FaPause,
  FaPlay, FaPlus, FaRedo, FaStepForward, FaTimes, FaTrash, FaCheck, FaEdit,
  FaHome, FaVolumeUp, FaVolumeMute, FaYoutube, FaComments, FaUsers
} from "react-icons/fa";
import { getFormattedTime, getFormattedDate } from "@/helpers/format";
import { getYoutubeId } from "@/helpers/youtube";
import { usePomodoro } from "@/controllers/usePomodoro";
import { useMenu, useRightMenu } from "@/controllers/useMenu";
import { useBackground } from "@/controllers/useBackground";
import { useYoutube } from "@/controllers/useYoutube";
import { useAmbientSound } from "@/controllers/useAmbientSound";
import Timer from "@/components/Timer";
import TaskList from "@/components/TaskList";
import Background from "@/components/Background";
import AmbientAudio from "@/components/AmbientAudio";
import Chat from "@/components/room/Chat"; // Integrated Chat

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
  rain: "🌧",
  cafe: "☕",
  forest: "🌲",
  fireplace: "🔥",
  ocean: "🌊",
  piano: "🎹"
};

export default function StudyRoomPage() {
  // Robust roomId extraction
  const params = useParams();
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    if (params?.roomId) {
      setRoomId(params.roomId);
    } else if (typeof window !== 'undefined') {
      // Fallback: extract from URL if useParams fails
      const pathParts = window.location.pathname.split('/');
      const idFromUrl = pathParts[pathParts.length - 1];
      if (idFromUrl && idFromUrl !== 'room') {
        setRoomId(idFromUrl);
      }
    }
  }, [params]);

  // Clerk user authentication
  const { user, isLoaded } = useUser();

  // Controllers/hooks
  const fullscreenRef = useRef(null);
  const tingRef = useRef(null);
  const sessionStartTimeRef = useRef(null);

  const {
    menuOpen, setMenuOpen, menuRef
  } = useMenu();
  const {
    rightMenuOpen, setRightMenuOpen, rightMenuRef
  } = useRightMenu();

  // Chat sidebar state
  const [chatOpen, setChatOpen] = useState(false);

  const {
    bg, setBg, bgTab, setBgTab
  } = useBackground();

  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState("default");
  const [isMuted, setIsMuted] = useState(false);
  const [sessionSubject, setSessionSubject] = useState("Group Study");
  const [isSavingSession, setIsSavingSession] = useState(false);

  // User profile state for chat
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user for chat identity
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data.profile) setUserProfile(data.profile);
      })
      .catch(err => console.error("Failed to load user for room", err));
  }, []);


  const {
    youtubeUrl, setYoutubeUrl, youtubeBg, setYoutubeBg, youtubeVolume,
    setYoutubeVolume, youtubeIframeRef, prevYoutubeVolume
  } = useYoutube(isMuted);
  const {
    ambientVolumes, setAmbientVolumes, audioRefs
  } = useAmbientSound(isMuted);
  const {
    isRunning, setIsRunning, isBreak, setIsBreak, secondsLeft,
    setSecondsLeft,
    activeWorkDuration, isPaused, setIsPaused, pauseTimer, resumeTimer, setActiveWorkDuration, activeBreakDuration,
    setActiveBreakDuration,
    pendingWorkDuration, setPendingWorkDuration, pendingBreakDuration,
    setPendingBreakDuration,
    pendingReset, setPendingReset, progress, setProgress, focusUnits,
    setFocusUnits,
    skipSession, resetTimer
  } = usePomodoro();

  // Task state
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editIdx, setEditIdx] = useState(-1);
  const [editText, setEditText] = useState("");
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Participants state
  const [participants, setParticipants] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  // Persistent Room Data
  const [roomDetails, setRoomDetails] = useState(null);
  const [dbMembers, setDbMembers] = useState([]);

  // Fetch Room Data (Name & All Members)
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      try {
        console.log("Fetching room data for:", roomId);
        const res = await fetch(`/api/rooms/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Room Data Fetched:", data);
          setRoomDetails(data.room);
          setDbMembers(data.members || []);
        } else {
          console.error("Room fetch failed:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch room details:", error);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Merge DB members with real-time participants
  const mergedMembers = React.useMemo(() => {
    // Create a map of online users for quick lookup
    const onlineMap = new Map(participants.map(p => [p.userId || p.id, p]));

    // Start with DB members
    const all = [...dbMembers].map(m => ({
      ...m,
      isOnline: onlineMap.has(m.id),
      // updates (like current streak/avatar) could come from socket, 
      // but mostly we trust DB for profile basics
    }));

    // Add any guests/new users who are online but NOT in the DB member list yet
    // (e.g. just joined but API hasn't refreshed)
    participants.forEach(p => {
      if (!all.find(m => m.id === (p.userId || p.id))) {
        all.push({
          id: p.userId || p.id,
          name: p.name,
          avatar: p.avatar,
          isOnline: true,
          isGuest: true
        });
      }
    });

    // Sort: Online first, then by name
    return all.sort((a, b) => {
      if (a.isOnline === b.isOnline) return a.name.localeCompare(b.name);
      return a.isOnline ? -1 : 1;
    });
  }, [dbMembers, participants]);

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Track session start time
  useEffect(() => {
    if (isRunning && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
  }, [isRunning]);

  // Save session data when session ends
  const saveSessionData = async () => {
    if (!user || !sessionStartTimeRef.current) return;

    setIsSavingSession(true);
    try {
      const sessionEndTime = new Date();
      const sessionDuration = Math.round((sessionEndTime - sessionStartTimeRef.current) / 1000 / 60); // in minutes
      const activeSounds = sounds.filter(s => ambientVolumes[s] > 0.01);

      const sessionData = {
        date: sessionStartTimeRef.current,
        duration: sessionDuration,
        subject: sessionSubject,
        focusScore: focusUnits,
        environment: {
          background: youtubeBg || bg,
          sounds: activeSounds,
          mode: "collaborative",
          roomName: `Room: ${roomId}`
        }
      };

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      console.log('Session saved successfully');
      sessionStartTimeRef.current = null;
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setIsSavingSession(false);
    }
  };

  // Modified end session handler
  const handleEndSession = async () => {
    if (sessionStartTimeRef.current && user) {
      await saveSessionData();
    }
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(pendingWorkDuration * 60);
    setFocusUnits(0);
    setPendingReset(false);
    sessionStartTimeRef.current = null;
  };

  // Handle tab close or reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!user || !sessionStartTimeRef.current || focusUnits < 1) return;

      const sessionEndTime = new Date();
      const sessionDuration = Math.round((sessionEndTime - sessionStartTimeRef.current) / 1000 / 60);
      const activeSounds = sounds.filter(s => ambientVolumes[s] > 0.01);

      const sessionData = {
        date: sessionStartTimeRef.current,
        duration: sessionDuration,
        subject: sessionSubject,
        focusScore: focusUnits,
        environment: {
          background: youtubeBg || bg,
          sounds: activeSounds,
          mode: "collaborative",
          roomName: `Room: ${roomId}`
        },
        userId: user.id // You’ll need this on the API side
      };

      // Send data to a lightweight endpoint that supports beacon
      navigator.sendBeacon('/api/sessions', JSON.stringify(sessionData));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, sessionSubject, focusUnits, youtubeBg, bg, ambientVolumes, roomId]);

  // Timer formatting
  const min = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const sec = String(secondsLeft % 60).padStart(2, "0");

  // Fullscreen toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'f' || e.key === 'F') &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement) &&
        !e.target.isContentEditable) {

        toggleFullscreen(e);
      }
    };

    const toggleFullscreen = (e) => {
      const el = fullscreenRef.current;
      if (!el) return;
      e.preventDefault();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen().catch(err => {
          console.error('Fullscreen error:', err);
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Play ting sound at end of session
  useEffect(() => {
    if (isRunning && secondsLeft === 1 && tingRef.current) {
      tingRef.current.currentTime = 0;
      tingRef.current.volume = 1;
      tingRef.current.play();
    }
  }, [isRunning, secondsLeft]);

  // Modified reset timer to handle session saving
  const handleResetTimer = async () => {
    resetTimer();
    sessionStartTimeRef.current = null;
  };

  // If user is not loaded yet, show loading
  if (!isLoaded) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Main render
  return (
    <div ref={fullscreenRef} className="w-screen h-screen min-h-0 min-w-0 overflow-hidden relative flex items-center justify-center">
      {/* Background Video/Image/YouTube */}
      <Background youtubeBg={youtubeBg} youtubeIframeRef={youtubeIframeRef} bg={bg} />

      {/* Ting sound for session end */}
      <audio ref={tingRef} src="/ting.mp3" preload="auto" />

      {/* Always-mounted audio elements for ambient sounds */}
      <AmbientAudio audioRefs={audioRefs} />

      {/* --- TOP HEADER (Room Name) --- */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
          <h1 className="text-white font-medium tracking-wide text-sm md:text-base">
            {roomDetails?.name || (roomId ? roomId.replace(/-/g, ' ') : "Loading Room...")}
          </h1>
        </div>
      </div>

      {/* --- Floating Side Menu (Settings/Timer/Bg/Sounds) --- */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-full z-30 transform transition-all duration-300 ease-in-out 
${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full w-80 p-6 flex flex-col gap-8 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar" style={{ maxHeight: '100vh' }}>
          <style jsx global>{`
.custom-scrollbar::-webkit-scrollbar {
width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
background: linear-gradient(135deg, #065f46 60%, #059669 100%);
border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
background: transparent;
}
.custom-scrollbar {
scrollbar-width: thin;
scrollbar-color: #059669 #065f46;
}
`}</style>
          <div className="flex justify-start items-center mb-4">
            <button
              className="pr-2 rounded-full hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              <FaChevronLeft className="text-lg" />
            </button>
            <h2 className="text-xl font-bold capitalize">
              {menuOpen === 'timer' ? 'Timer Settings' :
                menuOpen === 'background' ? 'Background' : menuOpen === 'mixer' ? 'Ambient Mixer' : 'Settings'}
            </h2>
          </div>

          {/* Timer Panel */}
          {menuOpen === 'timer' && (
            <div className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                {user && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Study Subject</label>
                    <input
                      type="text"
                      value={sessionSubject}
                      onChange={(e) => setSessionSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="What are you studying?"
                    />
                  </div>
                )}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Focus Duration</span>
                    <span className="font-mono">{pendingWorkDuration} min</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
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
                    min="0.1"
                    max="15"
                    value={pendingBreakDuration}
                    onChange={e => setPendingBreakDuration(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                {pendingReset && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className="text-xs text-red-600 font-semibold">Settings changed. Reset required.</span>
                    <button
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-xs"
                      onClick={handleResetTimer}
                      disabled={isSavingSession}
                    >
                      {isSavingSession ? 'Saving...' : 'Reset Timer'}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-8 flex-shrink-0">
                <button
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 rounded-lg font-semibold text-sm transition-all shadow"
                  onClick={handleEndSession}
                  disabled={isSavingSession}
                >
                  {isSavingSession ? 'Saving Session...' : 'End Session'}
                </button>
              </div>
            </div>
          )}

          {/* Background Panel (Simplified for brevity, re-using logic) */}
          {menuOpen === 'background' && (
            <div className="">
              <div className="Youtube mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaYoutube /> Youtube Player
                </h3>
                <div>
                  <div className="flex flex-col gap-2 items-center mb-2">
                    <input
                      type="text"
                      placeholder="Paste YouTube link..."
                      value={youtubeUrl}
                      onChange={e => setYoutubeUrl(e.target.value)}
                      className="w-full flex-1 px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <div className="flex gap-2 w-full">
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
                  </div>
                  {/* YouTube Volume Slider */}
                  {youtubeBg && getYoutubeId(youtubeBg) && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-900 text-xs">Volume</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={youtubeVolume}
                        onChange={e => setYoutubeVolume(Number(e.target.value))}
                        className="accent-green-500 w-32"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="Images/Videos">
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
                <div className="flex flex-col gap-2">
                  {(bgTab === 'static' ? staticBgOptions : dynamicBgOptions).map(opt => (
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
            </div>
          )}

          {/* Mixer Panel */}
          {menuOpen === 'mixer' && (
            <div className="space-y-4">
              {sounds.map((sound) => {
                const isActive = ambientVolumes[sound] > 0;
                return (
                  <div key={sound} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isActive ? "bg-white" : ""}`}>
                    <div className="text-2xl w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg">
                      {soundIcons[sound]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-green-800">{soundNames[sound]}</span>
                        <span className="text-xs font-mono bg-green-500/10 px-2 py-0.5 rounded text-green-700">{Math.round(ambientVolumes[sound] * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={ambientVolumes[sound]}
                        onChange={(e) => setAmbientVolumes((v) => ({ ...v, [sound]: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 flex justify-center">
                <button
                  className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
                  onClick={() => setAmbientVolumes(sounds.reduce((acc, s) => ({ ...acc, [s]: 0 }), {}))}
                >
                  <FaRedo className="text-xs" /> Reset all volumes
                </button>
              </div>
            </div>
          )}

          {/* Always-mounted audio elements */}
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

      {/* --- Left Toggle Buttons --- */}
      {!menuOpen && (
        <div className="fixed z-40 flex gap-2 left-4 top-4 flex-row md:flex-col md:gap-4 md:left-4 md:top-1/2 md:-translate-y-1/2">
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
          {/* Chat Toggle Button */}
          <button
            className={`bg-indigo-500/80 hover:bg-indigo-500 text-white rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all ${chatOpen ? 'ring-2 ring-white/50' : ''}`}
            onClick={() => setChatOpen(!chatOpen)}
            title="Open Chat"
            style={{ width: 48, height: 48 }}
          >
            <FaComments className="w-6 h-6" />
            {participants.length > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-900">{participants.length}</span>}
          </button>
        </div>
      )}

      {/* --- Right Floating Menu (Tasks) --- */}
      {!rightMenuOpen && (
        <button
          className="fixed top-1/2 right-0 z-40 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white/50 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all group"
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
          }}
          onClick={() => setRightMenuOpen(true)}
          title="Task List"
        >
          <span className="group-hover:scale-105 transition-transform" style={{ color: 'inherit' }}>Tasks</span>
        </button>
      )}

      <div
        ref={rightMenuRef}
        className={`fixed top-0 right-0 h-full z-80 transform transition-all duration-300 ease-in-out 
        ${rightMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full w-80 p-6 flex flex-col gap-6 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar shadow-2xl" style={{ maxHeight: '100vh' }}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Session Tasks</h2>
            <button
              className="p-2 rounded-full hover:bg-black/10"
              onClick={() => setRightMenuOpen(false)}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          <TaskList
            tasks={tasks}
            setTasks={setTasks}
            newTask={taskForm}
            setNewTask={setTaskForm}
            editIdx={editIdx}
            setEditIdx={setEditIdx}
            editText={editText}
            setEditText={setEditText}
          />
        </div>
      </div>

      {/* --- Chat Sidebar (Refined) --- */}
      <div
        className={`fixed top-0 right-0 h-full z-[90] transform transition-all duration-300 ease-in-out w-96 shadow-2xl bg-white
        ${chatOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-emerald-600 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <FaUsers /> Chat & Members
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full">
                <FaTimes />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <Chat roomId={roomId} user={userProfile} onParticipantsUpdate={setParticipants} />
          </div>
        </div>
      </div>


      {/* Top Right Controls (Enhanced) */}
      <div className="fixed top-4 right-4 z-40 flex flex-row-reverse gap-4 items-center">
        <Link
          href={user ? '/dashboard' : '/'}
          className="bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center"
          style={{ width: 48, height: 48 }}
        >
          <FaHome className="w-6 h-6" />
        </Link>

        {/* Members Toggle */}
        <div className="relative">
          <button
            className="bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all"
            style={{ width: 48, height: 48 }}
            onClick={() => setShowMembers(!showMembers)}
          >
            <FaUsers className="w-6 h-6" />
            {participants.length > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-green-900">{participants.length}</span>}
          </button>

          {/* Members Dropdown */}
          {showMembers && (
            <div className="absolute top-14 right-0 w-72 bg-white rounded-xl shadow-2xl p-4 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider flex justify-between items-center">
                Room Members
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{mergedMembers.length} Total</span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {mergedMembers.length === 0 && <p className="text-gray-400 text-xs italic">No members found.</p>}
                {mergedMembers.map((p, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${p.isOnline ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm ${p.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                      {p.avatar ? <img src={p.avatar} alt={p.name} className={`w-full h-full object-cover ${!p.isOnline && 'grayscale'}`} /> : p.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${p.isOnline ? 'text-gray-900' : 'text-gray-500'}`}>{p.name || 'Unknown'}</p>
                      <p className="text-xs flex items-center gap-1">
                        {p.isOnline ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-green-600 font-medium">Online</span>
                          </>
                        ) : (
                          <span className="text-gray-400">Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
            if (isMuted && prevYoutubeVolume.current > 0)
              setYoutubeVolume(prevYoutubeVolume.current);
          }}
        >
          {isMuted ? <FaVolumeMute className="w-6 h-6" /> : <FaVolumeUp className="w-6 h-6" />}
        </button>
      </div>

      {/* --- Centered Pomodoro Timer --- */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        {/* Real time */}
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
              onClick={() => {
                setIsRunning(true);
                if (isPaused) resumeTimer();
              }}
            >
              <FaPlay className="mr-2" /> {isPaused ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold shadow-lg hover:from-amber-600 hover:to-orange-600 transition flex items-center"
              onClick={pauseTimer}
            >
              <FaPause className="mr-2" /> Pause
            </button>
          )}

          <button
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold shadow-lg transition flex items-center"
            onClick={skipSession}
            disabled={isPaused}
          >
            <FaStepForward />
          </button>

          <button
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold shadow-lg transition flex items-center"
            onClick={() => {
              handleResetTimer();
              setIsPaused(false);
            }}
            disabled={isSavingSession}
          >
            <FaRedo />
          </button>
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-6 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-indigo-200 text-sm font-medium">Live Session</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Focus: {activeWorkDuration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Break: {activeBreakDuration} min</span>
            </div>
            {/* Sound Icons */}
            <div className="flex items-center gap-2">
              {(() => {
                const activeSounds = sounds.filter(s => ambientVolumes[s] > 0.01);
                const showSounds = activeSounds.slice(0, 2);
                return (
                  <>
                    <div className="text-xl flex gap-1">
                      {showSounds.map(s => <span key={s}>{soundIcons[s]}</span>)}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
