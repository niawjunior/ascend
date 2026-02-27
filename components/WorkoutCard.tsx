"use client";

import { WorkoutDefinition } from "@/lib/workoutData";
import { Dumbbell, Repeat, Mountain, Activity, Flame } from "lucide-react";

export default function WorkoutCard({ workout, onClick }: { workout: WorkoutDefinition, onClick: () => void }) {
  
  const IconMap: Record<string, React.ElementType> = {
    Dumbbell, Repeat, Mountain, Activity, Flame
  };
  const Icon = IconMap[workout.iconName] || Dumbbell;

  // Derive a dynamic text color class from the bg color for the icon
  const textColorClass = workout.color.replace('bg-', 'text-');

  return (
    <button 
      onClick={onClick}
      className={`relative w-full text-left overflow-hidden rounded-[2rem] border border-neutral-800/80 bg-neutral-900 transition-all duration-300 hover:border-neutral-600 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] hover:-translate-y-1 active:scale-[0.98] group h-56 md:h-64`}
    >
      {/* Background Image with animated scale */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
        style={{ backgroundImage: `url(${workout.imageUrl})` }}
      />
      {/* Better Gradient - Darker at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

      {/* Left Accent Bar */}
      <div className={`absolute top-0 left-0 w-2 h-full ${workout.color} z-20 group-hover:w-3 transition-all duration-300`} />
      
      {/* Content moved to bottom for the "Card" feel */}
      <div className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col justify-end">
        <div className="flex items-end justify-between w-full">
            <div className="pr-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2 drop-shadow-md tracking-tight">
                <Icon className={`w-6 h-6 ${textColorClass} filter drop-shadow-md`} />
                {workout.title}
              </h2>
              <p className="text-sm font-medium text-neutral-300 line-clamp-2 drop-shadow-sm">{workout.description}</p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 flex-shrink-0">
               <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
               </svg>
            </div>
        </div>
      </div>
    </button>
  );
}
