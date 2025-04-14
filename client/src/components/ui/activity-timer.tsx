import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/app-context";
import { speak } from "@/lib/tts";

interface ActivityTimerProps {
  onTimeComplete?: () => void;
}

export default function ActivityTimer({ onTimeComplete }: ActivityTimerProps) {
  const { userName } = useAppContext();
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const totalSeconds = timerMinutes * 60 + timerSeconds;
    if (totalSeconds <= 0) return;

    setTimeLeft({ minutes: timerMinutes, seconds: timerSeconds });
    setIsRunning(true);

    let secondsLeft = totalSeconds;
    timerRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft < 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        
        // Announce time is up
        const message = `${userName || 'Hey there'}, time for our next activity!`;
        speak(message);
        
        if (onTimeComplete) {
          onTimeComplete();
        }
      } else {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        setTimeLeft({ minutes, seconds });
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft({ minutes: 0, seconds: 0 });
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimerMinutes(parseInt(e.target.value));
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimerSeconds(parseInt(e.target.value));
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h3 className="font-semibold text-center mb-2">Timer</h3>
      
      <div className="text-center">
        {isRunning ? (
          <div className="text-3xl font-bold mb-4 text-primary">
            {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
          </div>
        ) : (
          <div className="flex justify-center space-x-1 mb-4">
            <select 
              className="p-2 border rounded-md bg-white"
              value={timerMinutes}
              onChange={handleMinutesChange}
              disabled={isRunning}
            >
              {Array.from({ length: 60 }, (_, i) => i).map(num => (
                <option key={`min-${num}`} value={num}>{formatTime(num)}</option>
              ))}
            </select>
            <span className="text-xl font-bold self-center">:</span>
            <select 
              className="p-2 border rounded-md bg-white"
              value={timerSeconds}
              onChange={handleSecondsChange}
              disabled={isRunning}
            >
              {Array.from({ length: 60 }, (_, i) => i).map(num => (
                <option key={`sec-${num}`} value={num}>{formatTime(num)}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-2">
        {!isRunning ? (
          <button 
            className="bg-primary text-white px-3 py-1 rounded-md hover:bg-blue-600"
            onClick={startTimer}
          >
            <i className="ri-play-line mr-1"></i>
            Start
          </button>
        ) : (
          <button 
            className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
            onClick={stopTimer}
          >
            <i className="ri-pause-line mr-1"></i>
            Pause
          </button>
        )}
        
        <button 
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400"
          onClick={resetTimer}
        >
          <i className="ri-refresh-line mr-1"></i>
          Reset
        </button>
      </div>
    </div>
  );
}