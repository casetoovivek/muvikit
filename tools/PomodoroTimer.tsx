import React, { useState, useEffect, useRef } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [message, setMessage] = useState('');

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
        if (seconds === 0) {
          if (minutes === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setMessage(isBreak ? "Break's over! Back to work." : "Time for a break!");
            handleSwitchMode(!isBreak, true);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, minutes, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    setMessage('');
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setMessage('');
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  const handleSwitchMode = (breakTime = false, autoStart = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(autoStart);
    setIsBreak(breakTime);
    setMinutes(breakTime ? 5 : 25);
    setSeconds(0);
    if (!autoStart) setMessage('');
  };

  const totalSeconds = (isBreak ? 5 : 25) * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const percentage = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  const pathColor = isBreak ? '#16a34a' : '#0d3e80'; // Green for break, theme primary for work
  
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const trailColor = theme === 'dark' 
    ? (isBreak ? '#14532d' : '#0c2e59') 
    : (isBreak ? '#dcfce7' : '#e0f2fe');
  
  const textColor = isBreak ? (theme === 'dark' ? '#4ade80' : '#16a34a') : (theme === 'dark' ? '#7dd3fc' : '#0d3e80');

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Pomodoro Timer</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Use the Pomodoro Technique to boost your focus.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-md mx-auto text-center space-y-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex justify-center gap-4">
            <button onClick={() => handleSwitchMode(false)} className={`px-4 py-2 text-sm font-medium rounded-lg ${!isBreak ? 'bg-[var(--theme-primary)] text-white' : 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300'}`}>Pomodoro</button>
            <button onClick={() => handleSwitchMode(true)} className={`px-4 py-2 text-sm font-medium rounded-lg ${isBreak ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300'}`}>Short Break</button>
        </div>

        <div className="w-64 h-64 mx-auto">
            <CircularProgressbar
                value={100 - percentage}
                text={`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
                styles={buildStyles({
                    textColor: textColor,
                    pathColor: pathColor,
                    trailColor: trailColor,
                })}
            />
        </div>
        
        {message && <p className="text-lg font-semibold text-[var(--theme-primary)] dark:text-sky-300">{message}</p>}

        <div className="flex justify-center gap-4">
            <button onClick={toggleTimer} className="px-8 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">
                {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer} className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">
                Reset
            </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;