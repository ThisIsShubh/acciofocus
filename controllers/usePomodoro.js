import { useState, useEffect, useRef } from "react";
export function usePomodoro(defaultWork = 25, defaultBreak = 5) {
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(defaultWork * 60);
    const [activeWorkDuration, setActiveWorkDuration] = useState(defaultWork);
    const [activeBreakDuration, setActiveBreakDuration] = useState(defaultBreak);
    const [pendingWorkDuration, setPendingWorkDuration] = useState(defaultWork);
    const [pendingBreakDuration, setPendingBreakDuration] = useState(defaultBreak);
    const [pendingReset, setPendingReset] = useState(false);
    const [progress, setProgress] = useState(100);
    const [focusUnits, setFocusUnits] = useState(0);
    const prevWork = useRef(defaultWork);
    const prevBreak = useRef(defaultBreak);
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
    useEffect(() => {
        if (!isRunning) return;
        if (secondsLeft === 0) {
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
    return {
        isRunning, setIsRunning,
        isBreak, setIsBreak,
        secondsLeft, setSecondsLeft,
        activeWorkDuration, setActiveWorkDuration,
        activeBreakDuration, setActiveBreakDuration,
        pendingWorkDuration, setPendingWorkDuration,
        pendingBreakDuration, setPendingBreakDuration,
        pendingReset, setPendingReset,
        progress, setProgress,
        focusUnits, setFocusUnits,
        skipSession, resetTimer
    };
}
