import React from "react";
export default function Timer({ min, sec, isBreak, progress, totalSeconds, secondsLeft }) {
    // If totalSeconds and secondsLeft are provided, use them for super-accurate progress
    let computedProgress;
    if (typeof totalSeconds === 'number' && typeof secondsLeft === 'number' && totalSeconds > 0) {
        computedProgress = (Math.max(0, secondsLeft - 1) / totalSeconds) * 100;
    } else {
        computedProgress = Number(progress);
    }
    // Clamp progress between 0 and 100
    const safeProgress = Math.max(0, Math.min(100, computedProgress));
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    // When progress is 100, offset is 0 (full circle); when 0, offset is full circumference (empty)
    const offset = circumference * (1 - safeProgress / 100);

    return (
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
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
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
    );
}
