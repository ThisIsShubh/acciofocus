import React from "react";
import { FaPlay, FaPause, FaRedo, FaStepForward } from "react-icons/fa";
import { usePomodoro } from "../controllers/usePomodoro";
import { getFormattedTime, getFormattedDate } from "../helpers/format";
import Timer from "./Timer";

function pad(num) {
  return String(num).padStart(2, "0");
}

export default function PomodoroTimer() {
  const {
    isRunning, setIsRunning,
    isBreak,
    secondsLeft,
    activeWorkDuration, setPendingWorkDuration,
    activeBreakDuration, setPendingBreakDuration,
    progress,
    focusUnits,
    skipSession,
    resetTimer
  } = usePomodoro(25, 5);

  const min = pad(Math.floor(secondsLeft / 60));
  const sec = pad(secondsLeft % 60);
  const now = new Date();
  const totalSeconds = (isBreak ? activeBreakDuration : activeWorkDuration) * 60;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Date and Time */}
      <div className="mb-8 text-center">
        <div className="text-2xl text-white font-medium tracking-wider">{getFormattedTime(now)}</div>
        <div className="text-white opacity-80">{getFormattedDate(now)}</div>
      </div>

      {/* Timer Circle */}
      <Timer
        min={min}
        sec={sec}
        isBreak={isBreak}
        progress={progress}
        totalSeconds={totalSeconds}
        secondsLeft={secondsLeft}
      />

      {/* Controls */}
      <div className="flex gap-4 mb-6">
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
    </div>
  );
}
