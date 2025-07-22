// =======================
// Solo Study Page (Room Version - base)
// =======================
"use client";

// =======================
// Helpers
// =======================
function getYoutubeId(url) {
    if (!url) return "";
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
}

import React, { useState, useEffect, useRef } from "react";
import { FaChevronRight, FaPlus, FaTrash, FaCheck, FaEdit, FaTimes, FaHome, FaClock, FaListUl } from "react-icons/fa";
import { FaChevronLeft, FaUserFriends, FaTrophy, FaCog, FaMusic, FaImage, FaPlay, FaPause, FaRedo, FaStepForward, FaVolumeUp, FaVolumeMute, FaYoutube } from "react-icons/fa";
import Link from "next/link";

const DEFAULT_BG = "gradient";

function getFormattedTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function getFormattedDate(date) {
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export default function SoloStudyPage() {
    const [bgTab, setBgTab] = useState('static');
    const fullscreenRef = useRef(null);
    const rightMenuRef = useRef(null);
    const [rightMenuOpen, setRightMenuOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editIdx, setEditIdx] = useState(null);
    const [editText, setEditText] = useState("");
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
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
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
    const [bg, setBg] = useState(DEFAULT_BG);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubeBg, setYoutubeBg] = useState("");
    const [youtubeVolume, setYoutubeVolume] = useState(100);
    const youtubeIframeRef = useRef(null);
    const [now, setNow] = useState(new Date());
    const [isMuted, setIsMuted] = useState(false);
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
    const [activeWorkDuration, setActiveWorkDuration] = useState(25);
    const [activeBreakDuration, setActiveBreakDuration] = useState(5);
    const [pendingWorkDuration, setPendingWorkDuration] = useState(25);
    const [pendingBreakDuration, setPendingBreakDuration] = useState(5);
    const [pendingReset, setPendingReset] = useState(false);
    const prevWork = useRef(25);
    const prevBreak = useRef(5);
    useEffect(() => {
        if (isRunning) {
            if (pendingWorkDuration !== prevWork.current || pendingBreakDuration !== prevBreak.current) {
                setPendingReset(true);
            }
        } else {
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
    const audioRefs = useRef({});
    const tingRef = useRef(null);
    useEffect(() => {
        sounds.forEach(sound => {
            const ref = audioRefs.current[sound];
            if (ref) {
                ref.loop = false;
                ref.volume = ambientVolumes[sound] * (isMuted ? 0 : 1);
                ref.onended = null;
                if (ambientVolumes[sound] > 0 && !isMuted) {
                    if (ref.paused) {
                        ref.currentTime = 0;
                        ref.play();
                    }
                    ref.onended = () => {
                        const originalVolume = ambientVolumes[sound] * (isMuted ? 0 : 1);
                        let fadeSteps = 5;
                        let fadeOut = setInterval(() => {
                            if (ref.volume > 0.01) {
                                ref.volume = Math.max(0, ref.volume - originalVolume / fadeSteps);
                            } else {
                                clearInterval(fadeOut);
                                ref.currentTime = 0;
                                ref.play().then(() => {
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
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        if (!isRunning) return;
        if (secondsLeft === 0) {
            if (tingRef.current) {
                tingRef.current.currentTime = 0;
                tingRef.current.volume = 1.0;
                tingRef.current.play();
            }
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
    const min = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const sec = String(secondsLeft % 60).padStart(2, "0");
    const skipSession = () => {
        setIsBreak(!isBreak);
        setSecondsLeft(isBreak ? activeWorkDuration * 60 : activeBreakDuration * 60);
        setProgress(100);
    };
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
    const prevYoutubeVolume = useRef(100);
    useEffect(() => {
        if (!youtubeBg || !youtubeIframeRef.current) return;
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

    // Right menu state for room: 'overview', 'tasks', 'activity'
    const [rightTab, setRightTab] = useState('overview');
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
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
                        background: "linear-gradient(135deg, #0f2027 0%, #2c7744 25%, #11998e 50%, #38ef7d 75%, #b2f9b9 100%)"
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
                        const vid = e.target;
                        if (vid.paused) vid.play();
                    }}
                />
            ) : (
                <div
                    className="absolute inset-0 w-full h-full z-0"
                    style={{
                        backgroundImage: `url(${bg.startsWith('/staticBg/') ? bg : `/staticBg/${bg.replace(/^\/+/,'')}`})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />
            )}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[3px] z-0"></div>
            <audio ref={tingRef} src="/ting.mp3" preload="auto" />
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 h-full z-30 transform transition-all duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
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
                        <div className="">
                            <div className="Youtube mb-8">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FaYoutube /> Youtube Player
                                </h3>
                                <div>
                                    <div className="flex flex-col gap-2 items-center mb-2">
                                        <p className="text-sm text-gray-600">Some videos can be restricted by the creator.</p>
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
                <div className="">
                    <div className="flex items-center justify-between mb-4">
                    </div>
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
            {
                !menuOpen && (
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
                )
            }
            {/* Right floating tab buttons */}
            {!rightPanelOpen && (
                <div className="fixed z-40 flex flex-col gap-2 right-4 top-1/2 -translate-y-1/2">
                    <button className={`bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all`} onClick={() => { setRightTab('overview'); setRightPanelOpen(true); }}>
                        <FaUserFriends className="w-6 h-6" />
                    </button>
                <button className={`bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all ${rightTab === 'tasks' ? 'ring-2 ring-green-400' : ''}`} title="Tasks & Goals" style={{ width: 48, height: 48 }} onClick={() => { setRightTab('tasks'); setRightPanelOpen(true); }}>
                        <FaListUl className="w-6 h-6" />
                    </button><button className={`bg-white/10 hover:bg-white/20 text-white/50 rounded-full p-3 shadow-lg backdrop-blur-sm flex items-center justify-center transition-all ${rightTab === 'activity' ? 'ring-2 ring-green-400' : ''}`} title="Achievements & Activity" style={{ width: 48, height: 48 }} onClick={() => { setRightTab('activity'); setRightPanelOpen(true); }}>
                        <FaTrophy className="w-6 h-6" />
                        </button>
                    </div>
                    
                    )}
            {/* Right floating panel */}
            {rightPanelOpen && (
                <div className="fixed top-0 right-0 h-full w-full md:w-[400px] z-50 bg-white/90 backdrop-blur-lg shadow-2xl border-l border-green-200 flex flex-col p-6 animate-slideInRight" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-green-900 font-extrabold text-xl tracking-wide drop-shadow">
                            {rightTab === 'overview' && (<><FaUserFriends className="opacity-80" /> Room Overview</>)}
                            {rightTab === 'tasks' && (<><FaListUl className="opacity-80" /> Tasks & Goals</>)}
                            {rightTab === 'activity' && (<><FaTrophy className="opacity-80" /> Achievements & Activity</>)}
                        </div>
                        <button className="text-green-900 hover:text-green-700 text-3xl font-bold px-2 transition-all" onClick={() => setRightPanelOpen(false)}>&times;</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {rightTab === 'overview' && (
                            <div className="text-green-900/80 text-lg font-semibold flex flex-col items-center justify-center h-full">Room Overview (members, stats, agenda, invite, ...)</div>
                        )}
                        {rightTab === 'tasks' && (
                            <div className="text-green-900/80 text-lg font-semibold flex flex-col items-center justify-center h-full">Personal Tasks & Goals</div>
                        )}
                        {rightTab === 'activity' && (
                            <div className="text-green-900/80 text-lg font-semibold flex flex-col items-center justify-center h-full">Achievements & Activity</div>
                        )}
                    </div>
                </div>
            )}
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
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                <div className="mb-8 text-center">
                    <div className="text-2xl text-white font-medium tracking-wider">{getFormattedTime(now)}</div>
                    <div className="text-white opacity-80">{getFormattedDate(now)}</div>
                </div>
                <div className="relative w-72 h-72 mb-8">
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-white font-mono">
                            {min}:{sec}
                        </div>
                        <div className={`text-lg font-semibold mt-2 ${isBreak ? "text-amber-400" : "text-green-400"}`}>
                            {isBreak ? "Break Time" : "Focus Time"}
                        </div>
                    </div>
                </div>
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
        </div >
    );
}
