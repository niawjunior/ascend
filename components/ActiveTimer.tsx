"use client";

import { useWorkoutTimer } from "@/hooks/useWorkoutTimer";
import { WorkoutDefinition } from "@/lib/workoutData";
import { Play, Pause, X, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import WorkoutCompleteSummary from "./WorkoutCompleteSummary";

export default function ActiveTimer({ workout, onExit }: { workout: WorkoutDefinition, onExit: () => void }) {
  const { state, controls } = useWorkoutTimer(workout);
  const isComplete = state.isFinished;
  
  // Clean minutes:seconds format
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return s.toString();
  };

  // We need to track how long we actually trained. We can derive this if needed, or use the Workout total time
  // For simplicity, we calculate total planned work if they hit complete.
  const totalReps = workout.sets * workout.repsPerSet;
  const totalWorkSecs = totalReps * workout.workTime;
  const totalRestSecs = (workout.sets * (workout.repsPerSet - 1) * workout.restTime) + ((workout.sets - 1) * workout.longRestTime);
  const totalDurationSeconds = workout.prepTime + totalWorkSecs + totalRestSecs;

  const handleSaveHistory = async (logData: any) => {
    try {
      const uid = localStorage.getItem("ascend_user_id");
      if (!uid) return onExit();

      // Fetch existing history to append
      const getRes = await fetch(`/api/history?userId=${uid}`);
      let existingHistory = [];
      if (getRes.ok) {
        const data = await getRes.json();
        existingHistory = data.history || [];
      }

      // Append new log
      const newLog = {
        id: `log_${Date.now()}`,
        date: new Date().toISOString(),
        ...logData
      };

      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, logs: [newLog, ...existingHistory] })
      });

      onExit();
    } catch (e) {
      console.error("Failed to save history", e);
      onExit();
    }
  };

  // Workout Completion Screen
  if (isComplete) {
    return (
      <WorkoutCompleteSummary 
        workout={workout}
        durationSeconds={totalDurationSeconds}
        onSave={handleSaveHistory}
        onDiscard={onExit}
      />
    );
  }

  // Determine current active color for UX cues
  let activeColorClass = "text-amber-500";
  let ringColorClass = "stroke-amber-500";
  if (state.isWork) {
    activeColorClass = "text-emerald-500";
    ringColorClass = "stroke-emerald-500";
  } else if (state.isRest) {
    activeColorClass = "text-rose-500";
    ringColorClass = "stroke-rose-500";
  }

  const progressPercentage = Math.max(0, state.timeLeft / (state.currentInterval?.duration || 1));

  return (
    <div className={`relative flex flex-col items-center justify-between h-[100dvh] w-full text-white p-6 pt-12 pb-10 transition-colors duration-1000 ${state.isWork ? 'bg-emerald-950/60 backdrop-blur-sm' : state.isRest ? 'bg-rose-950/60 backdrop-blur-sm' : state.isPrep ? 'bg-amber-950/60 backdrop-blur-sm' : 'bg-transparent'}`}>
      
      {/* Top Navigation Bar */}
      <div className="w-full flex justify-between items-center max-w-4xl mx-auto z-50 shrink-0 relative">
        <div className="text-neutral-400 font-medium tracking-wide uppercase text-sm md:text-base">
          Interval <span className="text-white font-bold">{state.currentIndex + 1}</span> / {state.totalIntervals}
        </div>
        <button 
          onClick={onExit}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-neutral-300 hover:text-white transition-colors focus:outline-none backdrop-blur-md"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-4xl mx-auto relative my-4 md:my-8 pointer-events-none">
        
        {/* Dynamic State Label (Work, Rest, Prep, etc.) */}
        <div className="w-full flex justify-center z-10 mb-4 md:mb-10 shrink-0 px-4">
          <motion.div 
            key={state.currentInterval?.id}
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className={`text-5xl md:text-[clamp(3.5rem,8vh,6rem)] font-black uppercase tracking-widest leading-tight py-2 ${activeColorClass} drop-shadow-[0_0_20px_currentColor] text-center`}
          >
            {state.currentInterval?.name || "Ready"}
          </motion.div>
        </div>

        {/* SVG Circular Progress Ring container flexes to fill available space without blowing out */}
        <div className="relative flex items-center justify-center w-full max-w-[18rem] md:max-w-full md:w-auto h-auto max-h-[60vh] aspect-square min-h-[16rem] md:min-h-[26rem] shrink mb-2 md:mb-6">
          
          {/* Background Track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none select-none drop-shadow-2xl overflow-visible" viewBox="-4 -4 108 108">
            <circle 
              cx="50" cy="50" r="46" 
              className="fill-transparent stroke-neutral-900/60" 
              strokeWidth="2"
            />
            {/* Animated Progress Ring */}
            <motion.circle 
              cx="50" cy="50" r="46" 
              className={`fill-transparent ${ringColorClass}`} 
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: progressPercentage }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          
          {/* Digital Clock Readout */}
          <div className="text-[6.5rem] md:text-[clamp(8rem,18vh,14rem)] font-black tabular-nums tracking-tighter leading-none z-10 filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {formatTime(state.timeLeft)}
          </div>
        </div>
      </div>

      {/* Media Controls for the Timer */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-10 md:gap-16 mt-auto z-50 shrink-0 mb-4 md:mb-8 relative pointer-events-auto">
        <button 
          onClick={controls.skipBackward}
          className="p-5 md:p-6 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white active:scale-95 transition-all focus:outline-none backdrop-blur-md"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
        </button>
        
        <button 
          onClick={controls.toggleTimer}
          className={`p-8 md:p-10 rounded-full shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-white/20
            ${state.isRunning ? 'bg-neutral-800 text-rose-500' : 'bg-white text-black'}`}
        >
          {state.isRunning ? <Pause className="w-12 h-12 md:w-16 md:h-16 fill-current" /> : <Play className="w-12 h-12 md:w-16 md:h-16 fill-current ml-[4px]" />}
        </button>

        <button 
          onClick={controls.skipForward}
          className="p-5 md:p-6 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white active:scale-95 transition-all focus:outline-none backdrop-blur-md"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
        </button>
      </div>

    </div>
  );
}
