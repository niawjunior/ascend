"use client";

import { WorkoutDefinition } from "@/lib/workoutData";
import { ChevronLeft, Clock, Copy, Dumbbell, Repeat, Mountain, Activity, Flame } from "lucide-react";

export default function WorkoutDetail({ workout, onBack, onStart }: { workout: WorkoutDefinition, onBack: () => void, onStart: () => void }) {
  
  const IconMap: Record<string, React.ElementType> = {
    Dumbbell, Repeat, Mountain, Activity, Flame
  };
  const Icon = IconMap[workout.iconName] || Dumbbell;

  // Calculate high-level duration estimates
  const totalReps = workout.sets * workout.repsPerSet;
  const totalWorkSecs = totalReps * workout.workTime;
  const totalRestSecs = (workout.sets * (workout.repsPerSet - 1) * workout.restTime) + ((workout.sets - 1) * workout.longRestTime);
  const totalDurationMin = Math.ceil((workout.prepTime + totalWorkSecs + totalRestSecs) / 60);

  const textColorClass = workout.color.replace('bg-', 'text-');

  return (
    <div className="flex flex-col h-[100dvh] md:h-full md:min-h-[85vh] animate-in fade-in slide-in-from-bottom-8 duration-500 bg-neutral-950/80 backdrop-blur-3xl md:border md:border-neutral-800/50 md:rounded-[2.5rem] md:shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-20 overflow-hidden">
      
      {/* Header / Back */}
      <button 
        onClick={onBack}
        className="absolute top-4 md:top-6 left-4 md:left-6 z-50 flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all duration-300 focus:outline-none border border-white/10 shadow-lg group"
      >
        <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
        {/* Hero Image Gallery Wrapper */}
        <div className="w-full h-72 md:h-96 shrink-0 relative bg-neutral-900 md:rounded-b-none z-0">
           
           {/* Inner Image Container (Clips image to modal top corners) */}
           <div className="absolute inset-0 overflow-hidden rounded-none md:rounded-t-[2.5rem]">
             <div 
               className="absolute inset-0 bg-cover bg-center" 
               style={{ backgroundImage: `url(${workout.imageUrl.startsWith('http') ? `/api/image?url=${encodeURIComponent(workout.imageUrl)}` : workout.imageUrl})` }}
             />
             {/* Superior gradient for desktop and mobile */}
             <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/20" />
           </div>
           
           {/* Floating Icon Map Bubble - Breaks safely out of overflow container */}
           <div className={`absolute bottom-0 right-8 md:right-12 translate-y-1/2 inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] ${workout.color} text-white shadow-2xl z-20 border-4 border-neutral-950`}>
             <Icon className="w-10 h-10" />
           </div>
        </div>

        <div className="px-6 md:px-12 flex-1 flex flex-col pt-8 pb-12">
          {/* Title & Description */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-sm">{workout.title}</h1>
            <p className="text-neutral-400 leading-relaxed text-lg md:text-xl font-medium">{workout.description}</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-neutral-500 mb-3 font-semibold tracking-wide uppercase text-xs md:text-sm">
                <Clock className="w-4 h-4" /> Total Duration
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">~{totalDurationMin} <span className="text-xl font-normal text-neutral-500 lowercase">min</span></div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm">
               <div className="flex items-center gap-2 text-neutral-500 mb-3 font-semibold tracking-wide uppercase text-xs md:text-sm">
                <Copy className="w-4 h-4" /> Structure
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">{workout.sets} <span className="text-xl font-normal text-neutral-500 lowercase">sets</span></div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden mb-8 shadow-sm">
            <div className="p-5 md:px-8 bg-neutral-800/30 border-b border-neutral-800/50 font-bold text-neutral-300 uppercase tracking-widest text-xs">
              Interval Breakdown
            </div>
            <div className="p-2 md:p-3 space-y-1">
               <BreakdownRow label="Work Interval" value={`${workout.workTime}s`} highlight />
               {workout.restTime > 0 && (
                 <BreakdownRow label="Rest Interval" value={`${workout.restTime}s`} />
               )}
               <BreakdownRow label="Reps per Set" value={`${workout.repsPerSet} reps`} />
               {workout.sets > 1 && (
                 <BreakdownRow label="Long Rest (Between Sets)" value={`${workout.longRestTime}s`} />
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button - Sticky at bottom */}
      <div className="p-6 md:p-8 bg-neutral-950 border-t border-neutral-900 shrink-0 select-none z-10">
        <button 
          onClick={onStart}
          className={`w-full py-6 md:py-8 rounded-2xl text-xl md:text-2xl font-black uppercase tracking-widest text-white shadow-[0_0_50px_-10px_theme(colors.white)] transition-all hover:scale-[1.02] active:scale-[0.98] ${workout.color} border border-white/20`}
        >
          START WORKOUT
        </button>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-4 px-5 md:px-6 rounded-xl ${highlight ? 'bg-neutral-800/40 text-white font-bold' : 'text-neutral-400'}`}>
      <span className="font-medium">{label}</span>
      <span className="font-mono text-xl md:text-2xl font-bold">{value}</span>
    </div>
  );
}
