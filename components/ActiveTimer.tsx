"use client";

import { useWorkoutTimer } from "@/hooks/useWorkoutTimer";
import { WorkoutDefinition } from "@/lib/workoutData";
import { X, Pause, Play, SkipForward, SkipBack } from "lucide-react";
import { motion } from "framer-motion";

export default function ActiveTimer({ workout, onExit }: { workout: WorkoutDefinition, onExit: () => void }) {
  const { state, controls } = useWorkoutTimer(workout);
  
  // Clean minutes:seconds format
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return s.toString();
  };

  // Workout Completion Screen
  if (state.isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-emerald-600 text-white p-6 animate-in fade-in zoom-in duration-500 text-center">
        <h1 className="text-6xl font-black italic tracking-widest uppercase mb-6">Workout<br/>Complete!</h1>
        <p className="text-emerald-100 text-xl font-medium mb-12">Amazing job crushing {workout.title}.</p>
        <button 
          onClick={onExit}
          className="px-10 py-5 rounded-2xl bg-white text-emerald-700 text-xl font-bold tracking-wider uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          Finish & Exit
        </button>
      </div>
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
          <SkipBack className="w-8 h-8 md:w-10 md:h-10 fill-current" />
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
          <SkipForward className="w-8 h-8 md:w-10 md:h-10 fill-current" />
        </button>
      </div>

    </div>
  );
}
