
"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { FaChevronLeft, FaClock, FaImage, FaListUl, FaMusic, FaPause, FaPlay, FaPlus, FaRedo, FaStepForward, FaTimes, FaTrash, FaCheck, FaEdit, FaHome, FaVolumeUp, FaVolumeMute, FaYoutube } from "react-icons/fa";
import { getFormattedTime, getFormattedDate } from "../../../helpers/format";
import { getYoutubeId } from "../../../helpers/youtube";
import { usePomodoro } from "../../../controllers/usePomodoro";
import { useMenu, useRightMenu } from "../../../controllers/useMenu";
import { useBackground } from "../../../controllers/useBackground";
import { useYoutube } from "../../../controllers/useYoutube";
import { useAmbientSound } from "../../../controllers/useAmbientSound";
import Timer from "../../../components/Timer";
import TaskList from "../../../components/TaskList";
import Background from "../../../components/Background";
import AmbientAudio from "../../../components/AmbientAudio";
import TingAudio from "../../../components/TingAudio";

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

export default function SoloStudyPage() {
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
    // Task state
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editIdx, setEditIdx] = useState(null);
    const [editText, setEditText] = useState("");

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


    // Main render
    return (
        <div ref={fullscreenRef} className="w-screen h-screen min-h-0 min-w-0 overflow-hidden relative flex items-center justify-center">
            {/* Background Video/Image/YouTube */}
            <Background youtubeBg={youtubeBg} youtubeIframeRef={youtubeIframeRef} bg={bg} />
            {/* Ting sound for session end */}
            <TingAudio tingRef={tingRef} />
            {/* Always-mounted audio elements for ambient sounds */}
            <AmbientAudio audioRefs={audioRefs} />

            {/* Floating Side Menu (contextual) */}
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
                            {/* End Session button only in timer menu, full width at bottom */}
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
                            <div className="Images/Videos">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FaImage /> Backgrounds
                                </h3>
                                {/* Capsule selector for Static/Live */}
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
                                {/* Show relevant options below */}
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
                                    {/* Audio elements moved outside menu for persistent playback */}
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
                    {/* Removed End Session button from background and mixer menus */}
                </div>
            </div>


            {/* Left Menu Toggle Buttons - Responsive: row at top left on mobile, column at 1/4 on md+ */}
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

            {/* Right Menu Toggle Button */}
            {
                !rightMenuOpen && (
                    <button
                        className="fixed right-0 z-40 bg-green-500/10 hover:bg-green-600 text-white rounded-full p-3 shadow-lg flex items-center"
                        onClick={() => setRightMenuOpen(true)}
                        title="Task List"
                    >
                        <FaListUl className="text-xl" />
                    </button>
                )
            }

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