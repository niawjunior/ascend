"use client";

import { useEffect, useState } from "react";
import { WorkoutLog } from "@/lib/workoutData";
import { Flame, Clock, Navigation, CheckCircle2 } from "lucide-react";
import ActivityHeatmap from "./ActivityHeatmap";

export default function StatsDashboard() {
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem("ascend_user_id");
    if (!uid) return;
    
    fetch(`/api/history?userId=${uid}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setIsLoading(false);
      })
      .catch(e => {
        console.error("Failed to load history", e);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center animate-pulse">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-neutral-600 font-bold tracking-widest uppercase mt-4 text-sm">Aggregating Data...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-12 text-center text-neutral-400">
         <Navigation className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
         <h3 className="text-xl font-bold text-white mb-2">No Training History</h3>
         <p>Complete your first workout to start tracking your progression.</p>
      </div>
    );
  }

  // Derived Metrics
  const totalWorkouts = history.length;
  const totalSeconds = history.reduce((acc, log) => acc + log.durationSeconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // Compute Streak (basic: contiguous days including today or yesterday)
  const sortedHistory = [...history].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const uniqueDates = [...new Set(sortedHistory.map(h => new Date(h.date).toDateString()))];
  
  let streak = 0;
  if (uniqueDates.length > 0) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const lastWorkoutDate = new Date(uniqueDates[0]);
    lastWorkoutDate.setHours(0,0,0,0);
    
    const diffDays = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays <= 1) {
      streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i-1]);
        const curr = new Date(uniqueDates[i]);
        const diff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 3600 * 24));
        if (diff === 1) streak++;
        else break;
      }
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-neutral-800/20 group-hover:-rotate-12 transition-transform duration-500">
            <CheckCircle2 className="w-32 h-32" strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-xs mb-2">Total Workouts</h3>
            <p className="text-4xl md:text-5xl font-black text-white">{totalWorkouts}</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-amber-500/10 group-hover:scale-110 transition-transform duration-500">
            <Clock className="w-32 h-32" strokeWidth={1} />
          </div>
          <div className="relative z-10">
             <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-xs mb-2">Time Under Tension</h3>
             <p className="text-4xl md:text-5xl font-black text-white">{totalHours} <span className="text-xl font-bold text-neutral-600">HR</span></p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-rose-500/10 group-hover:-translate-y-2 transition-transform duration-500">
            <Flame className="w-32 h-32" strokeWidth={1} />
          </div>
          <div className="relative z-10">
             <h3 className="text-neutral-500 font-bold uppercase tracking-widest text-xs mb-2">Current Streak</h3>
             <p className="text-4xl md:text-5xl font-black text-white">{streak} <span className="text-xl font-bold text-neutral-600 tracking-normal">DAYS</span></p>
          </div>
        </div>

      </div>

      {/* GitHub Style Heatmap Grid */}
      <ActivityHeatmap history={history} />

      {/* Chronological Log */}
      <div>
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-3">
           Training Log
        </h3>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          {sortedHistory.map((log, i) => (
             <div key={log.id} className={`p-6 md:p-8 border-neutral-800/80 ${i !== sortedHistory.length - 1 ? 'border-b' : ''} flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-800/30 transition-colors`}>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-emerald-500">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {log.rpe && <span className="text-xs font-bold text-white bg-neutral-800 px-2 py-0.5 rounded-md">RPE {log.rpe}</span>}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{log.title}</h4>
                  {log.notes && <p className="text-neutral-400 text-sm italic border-l-2 border-neutral-800 pl-3">"{log.notes}"</p>}
                </div>

                <div className="md:text-right shrink-0">
                   <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Duration</div>
                   <div className="text-2xl font-mono font-bold text-neutral-200">
                     {Math.floor(log.durationSeconds / 60)}<span className="text-base text-neutral-600">m</span> {log.durationSeconds % 60}<span className="text-base text-neutral-600">s</span>
                   </div>
                </div>

             </div>
          ))}
        </div>
      </div>

    </div>
  );
}
