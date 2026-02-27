"use client";

import { useState } from "react";
import { WORKOUT_LIBRARY, WorkoutDefinition } from "@/lib/workoutData";
import WorkoutCard from "@/components/WorkoutCard";
import WorkoutDetail from "@/components/WorkoutDetail";
import ActiveTimer from "@/components/ActiveTimer";

export default function Home() {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDefinition | null>(null);
  const [timerWorkout, setTimerWorkout] = useState<WorkoutDefinition | null>(null);

  return (
    <main className="min-h-[100dvh] bg-neutral-950 text-neutral-50 selection:bg-emerald-500/30 relative">
      
      {/* Global Fixed Background Image with Dark Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url(/assets/background.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-950/80 to-neutral-950" />
      </div>

      <div className="relative z-10 w-full h-full">
        {timerWorkout ? (
          <ActiveTimer 
            workout={timerWorkout} 
            onExit={() => setTimerWorkout(null)} 
          />
        ) : !activeWorkout ? (
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-500 pb-20">
            <header className="mb-12 md:mb-16 text-center md:text-left flex flex-col items-center md:items-start">
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-3 md:mb-4 uppercase drop-shadow-lg">Ascend</h1>
              <p className="text-neutral-400 text-lg md:text-xl font-medium tracking-wide">Professional Climbing Workouts</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {WORKOUT_LIBRARY.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  onClick={() => setActiveWorkout(workout)} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto md:px-6 md:py-12 h-[100dvh] md:h-auto md:min-h-[90vh]">
            <WorkoutDetail 
              workout={activeWorkout} 
              onBack={() => setActiveWorkout(null)} 
              onStart={() => {
                setTimerWorkout(activeWorkout);
                setActiveWorkout(null);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
