
// =======================
// Solo Study Page
// =======================
"use client";


// =======================
// Helpers
// =======================
// Helper to extract YouTube video ID from URL
// (Must be placed before any imports, JSX, or export in a Next.js client component file)
function getYoutubeId(url) {
    if (!url) return "";
    // Accepts full, short, and embed links
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
}



// =======================
// Imports
// =======================
import React, { useState, useEffect, useRef } from "react";
import { FaChevronRight, FaPlus, FaTrash, FaCheck, FaEdit, FaTimes, FaHome } from "react-icons/fa";
import { FaChevronLeft, FaCog, FaMusic, FaImage, FaPlay, FaPause, FaRedo, FaStepForward, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import Link from "next/link";


// =======================
// Constants
// =======================
const DEFAULT_BG = "gradient";


// =======================
// Formatting Helpers
// =======================
function getFormattedTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function getFormattedDate(date) {
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}


// =======================
// Main Component
// =======================
export default function SoloStudyPage() {
    // =======================
    // State & Refs
    // =======================
    // Ref for fullscreen container
    const fullscreenRef = useRef(null);
    // Right menu state
    const rightMenuRef = useRef(null);
    const [rightMenuOpen, setRightMenuOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editIdx, setEditIdx] = useState(null);
    const [editText, setEditText] = useState("");

    // =======================
    // Controllers: Menu Open/Close
    // =======================
    // Close right menu on click outside
    useEffect(() => {
        if (!rightMenuOpen) return;
        function handleClick(e) {
            if (rightMenuRef.current && !rightMenuRef.current.contains(e.target)) {
                setRightMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [rightMenuOpen]);
    // Ref for the side menu
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu on click outside
    useEffect(() => {
        if (!menuOpen) return;
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);
    // =======================
    // State: Background, YouTube, Sound, Timer, Theme, Focus Units
    // =======================
    const [bg, setBg] = useState(DEFAULT_BG);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubeBg, setYoutubeBg] = useState("");
    const [youtubeVolume, setYoutubeVolume] = useState(100); // 0-100
    const youtubeIframeRef = useRef(null);
    const [now, setNow] = useState(new Date());
    const [isMuted, setIsMuted] = useState(false);
    // Ambient sound state: allow multiple sounds and their volumes
    const [ambientVolumes, setAmbientVolumes] = useState({
        rain: 0.0,
        cafe: 0.0,
        forest: 0.0,
        fireplace: 0.0,
        ocean: 0.0,
        piano: 0.0
    });
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    // Active durations used by timer/progress
    const [activeWorkDuration, setActiveWorkDuration] = useState(25);
    const [activeBreakDuration, setActiveBreakDuration] = useState(5);
    // Pending (UI) durations
    const [pendingWorkDuration, setPendingWorkDuration] = useState(25);
    const [pendingBreakDuration, setPendingBreakDuration] = useState(5);
    // Track if settings have changed during an active session
    const [pendingReset, setPendingReset] = useState(false);
    const prevWork = useRef(25);
    const prevBreak = useRef(5);
    // =======================
    // Controllers: Pomodoro Settings Change
    // =======================
    useEffect(() => {
        if (isRunning) {
            if (pendingWorkDuration !== prevWork.current || pendingBreakDuration !== prevBreak.current) {
                setPendingReset(true);
            }
        } else {
            // If not running, apply changes immediately
            setActiveWorkDuration(pendingWorkDuration);
            setActiveBreakDuration(pendingBreakDuration);
            setSecondsLeft(pendingWorkDuration * 60);
            setProgress(100);
            setPendingReset(false);
        }
        prevWork.current = pendingWorkDuration;
        prevBreak.current = pendingBreakDuration;
    }, [pendingWorkDuration, pendingBreakDuration, isRunning]);
    const [progress, setProgress] = useState(100);
    const [theme, setTheme] = useState("default");
    const [focusUnits, setFocusUnits] = useState(0);

    // =======================
    // Constants: Background & Sound Options
    // =======================
    // Separate static and dynamic backgrounds for menu grouping
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
    // Audio refs for each sound
    const audioRefs = useRef({});
    // Ref for ting sound
    const tingRef = useRef(null);

    // =======================
    // Controllers: Ambient Sound Smooth Loop
    // =======================
    // Smooth loop for ambient sounds
    useEffect(() => {
        sounds.forEach(sound => {
            const ref = audioRefs.current[sound];
            if (ref) {
                ref.loop = false; // We'll handle looping manually
                ref.volume = ambientVolumes[sound] * (isMuted ? 0 : 1);
                // Remove previous event
                ref.onended = null;
                if (ambientVolumes[sound] > 0 && !isMuted) {
                    if (ref.paused) {
                        ref.currentTime = 0;
                        ref.play();
                    }
                    // Add smooth loop handler
                    ref.onended = () => {
                        // Fade out
                        const originalVolume = ambientVolumes[sound] * (isMuted ? 0 : 1);
                        let fadeSteps = 5;
                        let fadeOut = setInterval(() => {
                            if (ref.volume > 0.01) {
                                ref.volume = Math.max(0, ref.volume - originalVolume / fadeSteps);
                            } else {
                                clearInterval(fadeOut);
                                ref.currentTime = 0;
                                ref.play().then(() => {
                                    // Fade in
                                    let fadeInStep = 0;
                                    let fadeIn = setInterval(() => {
                                        fadeInStep++;
                                        ref.volume = Math.min(originalVolume, (fadeInStep / fadeSteps) * originalVolume);
                                        if (fadeInStep >= fadeSteps) clearInterval(fadeIn);
                                    }, 30);
                                });
                            }
                        }, 30);
                    };
                } else {
                    ref.pause();
                    ref.currentTime = 0;
                }
            }
        });
    }, [ambientVolumes, isMuted]);

    // =======================
    // Controllers: Real-time Clock
    // =======================
    // Real-time clock
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // =======================
    // Controllers: Pomodoro Timer Logic
    // =======================
    // Pomodoro timer logic
    useEffect(() => {
        if (!isRunning) return;

        if (secondsLeft === 0) {
                        // Play ting sound at end of session
            if (tingRef.current) {
                tingRef.current.currentTime = 0;
                tingRef.current.volume = 1.0;
                tingRef.current.play();
            }
            // If just finished a focus session, increment focusUnits
            if (!isBreak) setFocusUnits(f => f + 1);
            setIsBreak(!isBreak);
            setSecondsLeft(isBreak ? activeWorkDuration * 60 : activeBreakDuration * 60);
            return;
        }

        const timer = setTimeout(() => {
            setSecondsLeft(s => s - 1);
            const totalSeconds = (isBreak ? activeBreakDuration : activeWorkDuration) * 60;
            setProgress((secondsLeft / totalSeconds) * 100);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isRunning, secondsLeft, isBreak, activeWorkDuration, activeBreakDuration]);

    // =======================
    // UI: Timer Formatting
    // =======================
    // Format timer
    const min = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const sec = String(secondsLeft % 60).padStart(2, "0");

    // =======================
    // Controllers: Timer Controls
    // =======================
    // Skip to next session
    const skipSession = () => {
        setIsBreak(!isBreak);
        setSecondsLeft(isBreak ? activeWorkDuration * 60 : activeBreakDuration * 60);
        setProgress(100);
    };

    // Reset timer (apply pending settings)
    const resetTimer = () => {
        setIsRunning(false);
        setIsBreak(false);
        setActiveWorkDuration(pendingWorkDuration);
        setActiveBreakDuration(pendingBreakDuration);
        setSecondsLeft(pendingWorkDuration * 60);
        setProgress(100);
        setFocusUnits(0);
        setPendingReset(false);
    };

    // =======================
    // UI: Theme Style Helper
    // =======================
    // Get background style based on theme
    const getThemeStyle = () => {
        switch (theme) {
            case "dark":
                return "bg-gray-900 text-white";
            case "green":
                return "bg-emerald-900 text-white";
            case "blue":
                return "bg-blue-900 text-white";
            case "purple":
                return "bg-purple-900 text-white";
            default:
                return "bg-gradient-to-br from-blue-900 to-indigo-900 text-white";
        }
    };

    // =======================
    // Controllers: Task Handlers
    // =======================
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

    // =======================
    // Controllers: YouTube Volume Control & Mute
    // =======================
    // Store previous YouTube volume for mute toggle
    const prevYoutubeVolume = useRef(100);
    // Set YouTube volume via postMessage to iframe
    useEffect(() => {
        if (!youtubeBg || !youtubeIframeRef.current) return;
        // If muted, set volume to 0, else set to youtubeVolume
        const vol = isMuted ? 0 : youtubeVolume;
        const setVolume = () => {
            youtubeIframeRef.current.contentWindow.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: 'setVolume',
                    args: [vol]
                }),
                '*'
            );
        };
        setVolume();
        const t = setTimeout(setVolume, 800);
        return () => clearTimeout(t);
    }, [youtubeBg, youtubeVolume, isMuted]);

    // =======================
    // Controllers: Fullscreen Toggle
    // =======================
    // Fullscreen toggle on 'F' key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'f' || e.key === 'F') {
                const el = fullscreenRef.current;
                if (!el) return;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    el.requestFullscreen();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // =======================
    // UI: Render
    // =======================
    return (
        <div ref={fullscreenRef} className="w-screen h-screen min-h-0 min-w-0 overflow-hidden relative flex items-center justify-center">
            {/* Background Video or Image */}
            {youtubeBg ? (
                <div className="absolute inset-0 w-full h-full z-0">
                    <iframe
                        ref={youtubeIframeRef}
                        src={`https://www.youtube.com/embed/${getYoutubeId(youtubeBg)}?autoplay=1&controls=0&loop=1&playlist=${getYoutubeId(youtubeBg)}&modestbranding=1&rel=0&enablejsapi=1`}
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        frameBorder="0"
                        className="w-full h-full absolute inset-0 object-cover"
                        style={{ pointerEvents: 'none' }}
                        title="YouTube Background"
                    />
                </div>
            ) : bg === "gradient" ? (
                <div
                    className="absolute inset-0 w-full h-full z-0"
                    style={{
                        background: "linear-gradient(135deg, #22c55e 0%, #006e28ff 100%)"
                    }}
                />
            ) : bg.endsWith('.mp4') ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    src={bg.startsWith('/dynamicBg/') ? bg : `/dynamicBg/${bg.replace(/^\/+/,'')}`}
                    onLoadedMetadata={e => {
                        // Ensure autoplay works on all browsers
                        const vid = e.target;
                        if (vid.paused) vid.play();
                    }}
                />
            ) : (
                <div
                    className="absolute inset-0 w-full h-full z-0"
                    style={{
                        backgroundImage: `url(${bg.startsWith('/staticBg/') ? bg : `/staticBg/${bg.replace(/^\/+/, '')}`})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />
            )}
            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[3px] z-0"></div>


            {/* Ting sound for session end */}
            <audio ref={tingRef} src="/ting.mp3" preload="auto" />
            {/* Floating Side Menu */}
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 h-full z-30 transform transition-all duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div
                    className="h-full w-80 p-6 flex flex-col gap-8 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar"
                    style={{ maxHeight: '100vh' }}
                >
                    {/* Custom scrollbar styles */}
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
                    <div className="flex justify-start items-center">
                        <button
                            className="pr-2 rounded-full hover:bg-white/10"
                            onClick={() => setMenuOpen(false)}
                        >
                            <FaChevronLeft className="text-lg" />
                        </button>
                        <h2 className="text-xl font-bold">Study Settings</h2>
                    </div>

                    {/* Timer Settings */}
                    <div className="bg-green-500/10 p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FaCog /> Pomodoro Timer
                        </h3>
                        <div className="space-y-4">
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

                    {/* Ambient Sound Mixer */}
                    <div className="bg-green-500/10 p-4 rounded-lg shadow-lg ">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FaCog /> Ambient Sound Mixer
                        </h3>

                        </div>

                        <div className="space-y-4">
                            {sounds.map((sound) => {
                                const isActive = ambientVolumes[sound] > 0;
                                return (
                                    <div
                                        key={sound}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isActive ? "bg-white" : ""}`}
                                    >
                                        {/* Hidden audio element for each sound */}
                                        <audio
                                            ref={el => (audioRefs.current[sound] = el)}
                                            src={`/sounds/${sound}.mp3`}
                                            preload="auto"
                                        />
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

                    {/* Background */}
                    <div className="bg-green-500/10 p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FaImage /> Background
                        </h3>
                        <div className="flex flex-col gap-6">
                            <div>
                                <div className="font-semibold text-green-900 mb-2 text-sm uppercase tracking-wider">Static Images</div>
                                <div className="flex flex-col gap-2">
                                    {staticBgOptions.map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => { setBg(opt.key); setYoutubeBg(""); }}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${bg === opt.key && !youtubeBg ? "bg-green-500/80 text-white" : "bg-white/40 text-green-900 hover:bg-green-100"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold text-green-900 mb-2 text-sm uppercase tracking-wider">Live Videos</div>
                                <div className="flex flex-col gap-2">
                                    {dynamicBgOptions.map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => { setBg(opt.key); setYoutubeBg(""); }}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${bg === opt.key && !youtubeBg ? "bg-green-500/80 text-white" : "bg-white/40 text-green-900 hover:bg-green-100"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold text-green-900 mb-2 text-sm uppercase tracking-wider">YouTube Video</div>
                                <div className="flex flex-col gap-2 items-center mb-2">
                                    <p className="text-sm text-gray-600">Some videos can be restricted by the creator.</p>
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube link..."
                                        value={youtubeUrl}
                                        onChange={e => setYoutubeUrl(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                    <div className="flex gap-2 w-full">
                                        <button
                                            className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold text-xs"
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
                                {youtubeBg && !getYoutubeId(youtubeBg) && (
                                    <div className="text-xs text-red-600 mt-1">Invalid YouTube link</div>
                                )}
                                {/* YouTube Volume Slider in Settings */}
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
                    </div>




                    <div className="mt-auto">
                        <button
                            onClick={resetTimer}
                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                        >
                            End Session
                        </button>
                    </div>
                </div>
            </div>


            {/* Left Menu Toggle Button */}
            {!menuOpen && (
                <button
                    className="fixed top-4 left-4 z-40 bg-green-500/20 hover:bg-green-600 text-white rounded-full p-3 shadow-lg flex items-center"
                    onClick={() => setMenuOpen(true)}
                >
                    <FaCog className="text-xl" />
                </button>
            )}

            {/* Right Menu Toggle Button */}
            {!rightMenuOpen && (
                <button
                    className="fixed right-0 z-40 bg-green-500/10 hover:bg-green-600 text-white rounded-full p-3 shadow-lg flex items-center"
                    onClick={() => setRightMenuOpen(true)}
                >
                    <FaChevronLeft className="text-xl" />
                </button>
            )}

            {/* Right Floating Menu */}
            <div
                ref={rightMenuRef}
                className={`fixed top-0 right-0 h-full z-80 transform transition-all duration-300 ease-in-out ${rightMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div
                    className="h-full w-80 p-6 flex flex-col gap-6 bg-white text-black backdrop-blur-lg overflow-y-auto custom-scrollbar shadow-2xl"
                    style={{ maxHeight: '100vh' }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Session Tasks</h2>
                        <button 
                            className="p-2 rounded-full hover:bg-black/10"
                            onClick={() => setRightMenuOpen(false)}
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={e => setNewTask(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
                            placeholder="Add a new task..."
                            className="flex-1 px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg"
                            onClick={handleAddTask}
                        >
                            <FaPlus />
                        </button>
                    </div>
                    <ul className="flex-1 flex flex-col gap-2">
                        {tasks.length === 0 && (
                            <li className="text-gray-400 italic text-center">No tasks yet.</li>
                        )}
                        {tasks.map((task, idx) => (
                            <li key={idx} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${task.done ? 'bg-green-100 line-through text-green-700' : 'bg-white'}`}>
                                <button
                                    className={`p-1 rounded-full border ${task.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
                                    onClick={() => handleToggleTask(idx)}
                                >
                                    <FaCheck />
                                </button>
                                {editIdx === idx ? (
                                    <>
                                        <input
                                            className="flex-1 px-2 py-1 rounded border border-green-300"
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(idx); if (e.key === 'Escape') handleCancelEdit(); }}
                                            autoFocus
                                        />
                                        <button className="p-1 text-green-600" onClick={() => handleSaveEdit(idx)}><FaCheck /></button>
                                        <button className="p-1 text-gray-400" onClick={handleCancelEdit}><FaTimes /></button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 cursor-pointer" onDoubleClick={() => handleEditTask(idx)}>{task.text}</span>
                                        <button className="p-1 text-blue-500" onClick={() => handleEditTask(idx)}><FaEdit /></button>
                                        <button className="p-1 text-red-500" onClick={() => handleDeleteTask(idx)}><FaTrash /></button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Top Right Controls: Back Button & Sound Control */}
            <div className="fixed top-4 right-4 z-40 flex flex-row-reverse gap-4">
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
                        // Mute/unmute all audio including YouTube
                        setIsMuted(muted => {
                            // If muting, store current YouTube volume
                            if (!muted) prevYoutubeVolume.current = youtubeVolume;
                            // If unmuting, restore previous YouTube volume
                            if (muted && youtubeVolume === 0 && prevYoutubeVolume.current > 0) {
                                setYoutubeVolume(prevYoutubeVolume.current);
                            }
                            return !muted;
                        });
                        // If muting, set YouTube volume to 0
                        if (!isMuted) setYoutubeVolume(0);
                        // If unmuting, restore previous YouTube volume
                        if (isMuted && prevYoutubeVolume.current > 0) setYoutubeVolume(prevYoutubeVolume.current);
                    }}
                >
                    {isMuted ? <FaVolumeMute className="w-6 h-6" /> : <FaVolumeUp className="w-6 h-6" />}
                </button>
            </div>

            {/* Centered Pomodoro Timer */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                {/* Real time and date */}
                <div className="mb-8 text-center">
                    <div className="text-2xl text-white font-medium tracking-wider">{getFormattedTime(now)}</div>
                    <div className="text-white opacity-80">{getFormattedDate(now)}</div>
                </div>

                {/* Circular Progress Timer */}
                <div className="relative w-72 h-72 mb-8">
                    {/* Progress circle */}
                    <div className="absolute inset-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={isBreak ? "#f59f0b5c" : "#00c9503e"}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                                transform="rotate(-90 50 50)"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                    </div>

                    {/* Timer display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-white font-mono">
                            {min}:{sec}
                        </div>
                        <div className={`text-lg font-semibold mt-2 ${isBreak ? "text-amber-400" : "text-green-400"}`}>
                            {isBreak ? "Break Time" : "Focus Time"}
                        </div>
                    </div>
                </div>

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
                            <span className="text-green-400 font-mono text-base">🍅 {focusUnits}</span>
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
        </div>
    );
}