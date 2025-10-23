import React, { useState, useEffect, useRef } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [message, setMessage] = useState('');

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                // Timer finished
                if (timerRef.current) clearInterval(timerRef.current);
                setMessage(isBreak ? "Break's over! Back to work." : "Time for a break!");
                handleSwitchMode(!isBreak, true); // Auto-start the next phase
                return 0;
              } else {
                return prevMinutes - 1;
              }
            });
            return 59;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isBreak]);
  
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
    if (autoStart) {
        if(Notification.permission === 'granted') {
             new Notification(breakTime ? "Time for a short break!" : "Break is over, time to focus!");
        }
    }
  };

  useEffect(() => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
  }, []);

  const totalSeconds = (isBreak ? 5 : 25) * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const percentage = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  const pathColor = isBreak ? '#16a34a' : 'var(--theme-primary)';
  
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const trailColor = theme === 'dark' 
    ? (isBreak ? '#14532d' : '#0c2e59') 
    : (isBreak ? '#dcfce7' : '#e0f2fe');
  
  const textColor = isBreak ? (theme === 'dark' ? '#4ade80' : '#16a34a') : (theme === 'dark' ? '#7dd3fc' : 'var(--theme-primary)');

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Online Pomodoro Timer</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Boost your productivity and focus by breaking down your work into manageable intervals with our free Pomodoro Timer.</p>
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
            <button onClick={toggleTimer} className="px-8 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors text-lg">
                {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer} className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">
                Reset
            </button>
        </div>
      </div>
      
       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is the Pomodoro Technique?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">The Pomodoro Technique is a time management method developed by Francesco Cirillo. It uses a timer to break work into focused 25-minute intervals, separated by short breaks. Each interval is known as a "pomodoro," from the Italian word for 'tomato,' after the tomato-shaped kitchen timer Cirillo used as a university student. This technique is designed to improve focus, reduce mental fatigue, and increase productivity by preventing burnout and encouraging a consistent workflow.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use the Pomodoro Timer</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Choose a Task:</strong> Decide on the task you want to work on.</li>
            <li><strong>Start the Timer:</strong> Click the "Start" button to begin a 25-minute focus session.</li>
            <li><strong>Work without Distractions:</strong> Focus solely on your task until the timer rings.</li>
            <li><strong>Take a Short Break:</strong> When the session ends, the timer will automatically switch to a 5-minute break. Step away from your work and relax.</li>
            <li><strong>Repeat:</strong> After the break, the timer will prompt you to start another Pomodoro session. After four pomodoros, it is recommended to take a longer break of 15-30 minutes.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using a Pomodoro Timer</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Improved Focus:</strong> Short, timed intervals help you concentrate on one task at a time.</li>
            <li><strong>Reduces Procrastination:</strong> The 25-minute commitment makes it easier to start on large or daunting tasks.</li>
            <li><strong>Prevents Burnout:</strong> Regular short breaks allow your mind to rest and recharge, maintaining high productivity over longer periods.</li>
            <li><strong>Simple and Effective:</strong> A straightforward method that anyone can adopt to manage their time better.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Can I change the length of the timer?</h3>
                <p>This is a classic Pomodoro timer with the standard 25-minute work and 5-minute break intervals. We may add customizable times in a future update.</p>
              </div>
              <div>
                <h3 className="font-semibold">What happens if I get distracted?</h3>
                <p>If you get interrupted during a pomodoro, the best practice is to either pause the timer and resume, or reset it and start a new session. The key is to protect your 25-minute focus blocks.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default PomodoroTimer;