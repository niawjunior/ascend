import { useState, useEffect, useRef, useCallback } from "react";
import { WorkoutDefinition, Interval, generateIntervalSequence } from "@/lib/workoutData";

export interface TimerState {
  currentInterval: Interval | null;
  currentIndex: number;
  totalIntervals: number;
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  durationPercentage: number;
  isPrep: boolean;
  isWork: boolean;
  isRest: boolean;
}

// Simple Web Audio API function to create extremely fast synthesized "beeps"
// This prevents needing to download external mp3s and guarantees perfect sync
const playBeep = (freq: number, vol = 0.5) => {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    
    // Quick fade out so it sounds like a sharp beep instead of a continuous tone
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {
    console.error("Audio Context failed", e);
  }
};

export function useWorkoutTimer(workout: WorkoutDefinition) {
  const [sequence, setSequence] = useState<Interval[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Flatten the workout into a massive linear array of independent intervals
  useEffect(() => {
    const seq = generateIntervalSequence(workout);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSequence(seq);
    if (seq.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(seq[0].duration);
    }
  }, [workout]);

  // The core 1-second countdown engine
  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      // Audio Cues on the last 3, 2, 1 and GO seconds
      if (prev === 4) playBeep(440);      // Beep 3
      else if (prev === 3) playBeep(440); // Beep 2
      else if (prev === 2) playBeep(440); // Beep 1
      else if (prev === 1) playBeep(880, 0.8); // High Pitch GO

      if (prev <= 1) {
        // Step forward to next interval
        const nextIndex = currentIndex + 1;
        if (nextIndex < sequence.length) {
          setCurrentIndex(nextIndex);
          return sequence[nextIndex].duration;
        } else {
          // The workout is completely over
          setIsFinished(true);
          setIsRunning(false);
          return 0;
        }
      }
      return prev - 1;
    });
  }, [currentIndex, sequence]);

  // Bind the clock interval
  useEffect(() => {
    if (isRunning && !isFinished) {
      timerRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isFinished, tick]);

  // Controls
  const toggleTimer = () => setIsRunning(!isRunning);
  
  const skipForward = () => {
    if (currentIndex < sequence.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(sequence[currentIndex + 1].duration);
    } else {
      setIsFinished(true);
      setIsRunning(false);
      setTimeLeft(0);
    }
  };

  const skipBackward = () => {
    if (currentIndex > 0) {
      // UX Detail: If we are more than 2 seconds into the current interval, 
      // pausing and rewinding should just restart the *current* interval.
      const currentDuration = sequence[currentIndex].duration;
      if (currentDuration - timeLeft > 2) {
        setTimeLeft(currentDuration);
      } else {
        // Otherwise step all the way back to the previous interval
        setCurrentIndex(currentIndex - 1);
        setTimeLeft(sequence[currentIndex - 1].duration);
      }
    } else {
      setTimeLeft(sequence[0]?.duration || 0); // Restart from beginning
    }
  };

  // State calculations
  const currentInterval = sequence[currentIndex] || null;
  const durationPercentage = currentInterval ? ((currentInterval.duration - timeLeft) / currentInterval.duration) * 100 : 0;

  return {
    state: {
      currentInterval,
      currentIndex,
      totalIntervals: sequence.length,
      timeLeft,
      isRunning,
      isFinished,
      durationPercentage,
      isPrep: currentInterval?.type === 'prep',
      isWork: currentInterval?.type === 'work',
      isRest: currentInterval?.type === 'rest' || currentInterval?.type === 'longRest'
    },
    controls: {
      toggleTimer,
      skipForward,
      skipBackward
    }
  };
}
