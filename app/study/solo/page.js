"use client";

import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaCog, FaMusic, FaImage, FaPlay, FaPause, FaRedo, FaChevronRight } from "react-icons/fa";
import Link from "next/link";

const DEFAULT_BG = "/2.png";

function getFormattedTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function getFormattedDate(date) {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function SoloStudyPage() {
  const [bg, setBg] = useState(DEFAULT_BG);
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  // Pomodoro state
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Pomodoro timer logic
  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft === 0) {
      setIsBreak((prev) => !prev);
      setSecondsLeft(isBreak ? workDuration * 60 : breakDuration * 60);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft, isBreak, workDuration, breakDuration]);

  // Format timer
  const min = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const sec = String(secondsLeft % 60).padStart(2, "0");

  // Background options
  const backgrounds = ["/2.png", "/1.png", "/3.png", "/cover.png", "/A.png", "/D.png"];

  return (
    <div
      className="w-screen h-screen min-h-0 min-w-0 overflow-hidden relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Floating Side Menu */}
      <div className={`fixed top-1/2 left-0 z-30 transform -translate-y-1/2 transition-all duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div
          className="bg-white/30 backdrop-blur-[18px] rounded-r-2xl shadow-2xl p-6 w-64 flex flex-col gap-6 border border-white/30 border-l-0"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18), inset 0 1.5px 8px 0 rgba(255,255,255,0.25)",
            borderLeft: "none",
            borderRight: "1.5px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <button className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-green-500 text-white rounded-full p-2 shadow-lg" onClick={() => setMenuOpen(false)}>
            <FaChevronLeft />
          </button>
          <h3 className="text-lg font-bold text-green-600 mb-2">Options</h3>
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-2"><FaCog /> Pomodoro Timer</label>
            <div className="flex gap-2 items-center mb-2">
              <span>Work</span>
              <input type="number" min={1} max={60} value={workDuration} onChange={e => setWorkDuration(Number(e.target.value))} className="w-12 px-2 py-1 rounded border" />
              <span>min</span>
            </div>
            <div className="flex gap-2 items-center">
              <span>Break</span>
              <input type="number" min={1} max={30} value={breakDuration} onChange={e => setBreakDuration(Number(e.target.value))} className="w-12 px-2 py-1 rounded border" />
              <span>min</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-2"><FaMusic /> Ambient Sound</label>
            <select className="w-full px-2 py-1 rounded border">
              <option>None</option>
              <option>Rain</option>
              <option>Cafe</option>
              <option>Forest</option>
              <option>White Noise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-2"><FaImage /> Background</label>
            <div className="flex flex-wrap gap-2">
              {backgrounds.map((b) => (
                <button key={b} className={`w-10 h-10 rounded-lg border-2 ${bg === b ? "border-green-500" : "border-transparent"}`} style={{ backgroundImage: `url(${b})`, backgroundSize: "cover" }} onClick={() => setBg(b)} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Menu Toggle Button */}
      {!menuOpen && (
        <button className="fixed top-1/2 left-0 z-40 transform -translate-y-1/2 bg-green-500 text-white rounded-r-full p-3 shadow-lg" onClick={() => setMenuOpen(true)}>
          <FaChevronRight />
        </button>
      )}

      {/* Back Button */}
      <Link href="/" className="fixed top-8 left-8 z-40 bg-white/80 hover:bg-white text-green-600 rounded-full p-3 shadow-lg transition">
        <FaChevronLeft className="text-xl" />
      </Link>

      {/* Centered Pomodoro Timer */}
      <div className="flex flex-col items-center justify-center w-full h-full">
        {/* Real time and date */}
        <div className="mb-2 text-center">
          <div className="text-lg text-white/80 font-mono tracking-widest">{getFormattedTime(now)}</div>
          <div className="text-xs text-white/70 font-mono">{getFormattedDate(now)}</div>
        </div>
        <div
          className="bg-white/30 backdrop-blur-[18px] rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6 min-w-[340px] border border-white/30"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18), inset 0 1.5px 8px 0 rgba(255,255,255,0.25)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <div className="text-5xl md:text-7xl font-bold text-green-600 mb-2 font-mono tracking-widest">
            {min}:{sec}
          </div>
          <div className="text-md text-gray-700 mb-4 font-semibold">
            {isBreak ? "Break Time!" : "Focus Time"}
          </div>
          <div className="flex gap-4">
            {!isRunning ? (
              <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold shadow hover:from-green-600 hover:to-emerald-700 transition text-lg" onClick={() => setIsRunning(true)}>
                <FaPlay className="inline mr-2" /> Start
              </button>
            ) : (
              <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold shadow hover:from-green-600 hover:to-emerald-700 transition text-lg" onClick={() => setIsRunning(false)}>
                <FaPause className="inline mr-2" /> Pause
              </button>
            )}
            <button className="px-6 py-2 bg-white/80 text-green-600 rounded-lg font-bold shadow hover:bg-white transition text-lg border border-green-200" onClick={() => {
              setIsRunning(false);
              setIsBreak(false);
              setSecondsLeft(workDuration * 60);
            }}>
              <FaRedo className="inline mr-2" /> Reset
            </button>
            <button className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold shadow hover:bg-red-600 transition text-lg" onClick={() => {
              setIsRunning(false);
              setIsBreak(false);
              setSecondsLeft(workDuration * 60);
            }}>
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
