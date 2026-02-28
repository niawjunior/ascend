"use client";

import { useMemo } from "react";
import { WorkoutLog } from "@/lib/workoutData";

export default function ActivityHeatmap({ history }: { history: WorkoutLog[] }) {
  // Generate a professional 52-week grid mapped to exact days of the week
  const { weeks, monthLabels, maxIntensity, totalWeeks } = useMemo(() => {
    const intensityMap = new Map<string, number>();
    
    // 1. Aggregate duration (intensity) by date string: YYYY-MM-DD
    history.forEach(log => {
      const db = new Date(log.date);
      const dateKey = `${db.getFullYear()}-${String(db.getMonth() + 1).padStart(2, '0')}-${String(db.getDate()).padStart(2, '0')}`;
      const current = intensityMap.get(dateKey) || 0;
      intensityMap.set(dateKey, current + (log.durationSeconds / 60));
    });

    let highestMapVal = 0;
    intensityMap.forEach(val => { if (val > highestMapVal) highestMapVal = val; });

    // 2. We want 52 weeks (1 full year). Find the Sunday that starts 52 weeks ago.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine the exact number of days to go back to find a Sunday
    // current day of week (0 = Sun, 1 = Mon ... 6 = Sat)
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayOfWeek = today.getDay(); 
    
    // We want 52 full weeks before the current week = 52 * 7 = 364 days.
    // Plus the days elapsed in the current week (dayOfWeek + 1).
    const TOTAL_WEEKS = 52;
    const totalDaysToRender = (TOTAL_WEEKS * 7) + (dayOfWeek + 1);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDaysToRender + 1);

    const generatedWeeks = [];
    const generatedMonthLabels = [];
    let currentMonth = -1;

    let currentDay = new Date(startDate);
    
    // 3. Build the grid
    for (let w = 0; w < Math.ceil(totalDaysToRender / 7); w++) {
      const weekDays: any[] = [];
      
      for (let d = 0; d < 7; d++) {
        // If we exceed today, just leave the rest of the week array empty so css grid can skip it or render empty
        if (currentDay.getTime() > today.getTime()) {
          weekDays.push(null);
          continue;
        }

        const dateKey = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
        const mth = currentDay.getMonth();
        
        // Track when the month changes to place a label
        if (mth !== currentMonth && d === 0) {
          if (generatedMonthLabels.length === 0 || (w - generatedMonthLabels[generatedMonthLabels.length - 1].colIndex >= 3)) {
             generatedMonthLabels.push({
               label: currentDay.toLocaleString('default', { month: 'short' }),
               colIndex: w
             });
          }
          currentMonth = mth;
        }

        weekDays.push({
          date: new Date(currentDay),
          dateString: dateKey,
          minutes: intensityMap.get(dateKey) || 0,
          isToday: dateKey === todayStr
        });

        currentDay.setDate(currentDay.getDate() + 1);
      }
      generatedWeeks.push(weekDays);
    }

    return { weeks: generatedWeeks, monthLabels: generatedMonthLabels, maxIntensity: highestMapVal || 60, totalWeeks: generatedWeeks.length };
  }, [history]);

  // Determine square color based on relative intensity
  const getColor = (minutes: number, isToday: boolean) => {
    if (minutes === 0) {
      return isToday ? "bg-neutral-800 border-neutral-700" : "bg-neutral-900 border-neutral-800/50";
    }
    const ratio = minutes / maxIntensity;
    if (ratio < 0.25) return "bg-emerald-950 border-emerald-900";
    if (ratio < 0.5) return "bg-emerald-800 border-emerald-700 text-white";
    if (ratio < 0.75) return "bg-emerald-600 border-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    return "bg-emerald-400 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)] z-10 text-black"; 
  };

  return (
    <div className="bg-[#0B0B0B] border border-neutral-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative w-full">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none overflow-hidden" />

      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4 md:mb-8 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500)] animate-pulse"></span>
        Activity Heatmap
      </h3>
      
      <div className="w-full flex flex-col overflow-x-auto pb-4 scrollbar-hide">
        
        {/* Month Labels Axis */}
        <div className="flex mb-2 pl-[42px] md:pl-[46px] w-full relative h-4">
          {monthLabels.map((m, i) => (
             <span 
               key={i}
               className="absolute text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest"
               style={{ left: `${(m.colIndex / totalWeeks) * 100}%` }}
             >
               {m.label}
             </span>
          ))}
        </div>

        <div className="flex w-full items-start">
          {/* Day of Week Axis */}
          <div className="flex flex-col gap-[8px] md:gap-3 mr-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest leading-4 pt-[2px] shrink-0">
            <div className="h-4 md:h-5 invisible">Sun</div>
            <div className="h-4 md:h-5 flex items-center">Mon</div>
            <div className="h-4 md:h-5 invisible flex items-center">Tue</div>
            <div className="h-4 md:h-5 flex items-center">Wed</div>
            <div className="h-4 md:h-5 invisible flex items-center">Thu</div>
            <div className="h-4 md:h-5 flex items-center">Fri</div>
            <div className="h-4 md:h-5 invisible flex items-center">Sat</div>
          </div>

          {/* The Grid (Columns = Weeks, Rows = Days) */}
          <div className="flex justify-between flex-1 gap-[2px] md:gap-[4px] lg:gap-2">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-[8px] md:gap-3">
                {week.map((day, dIndex) => {
                  if (!day || !day.date) return <div key={`empty-${dIndex}`} className="w-4 h-4 md:w-5 md:h-5 rounded-sm" />; // Empty slot for future days this week
                  
                  return (
                    <div 
                      key={day.dateString} 
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[6px] border transition-all duration-300 group relative ${getColor(day.minutes, day.isToday)} hover:scale-125 hover:z-20 cursor-crosshair`}
                    >
                      {/* Premium Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max bg-neutral-900 border border-neutral-700 shadow-2xl rounded-xl z-[100] pointer-events-none overflow-hidden">
                        <div className="bg-neutral-800/50 px-3 py-1.5 border-b border-neutral-800 flex justify-between gap-4">
                          <span className="text-xs font-bold text-neutral-300">
                            {day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                          </span>
                        </div>
                        <div className="px-3 py-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${day.minutes > 0 ? 'bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500)]' : 'bg-neutral-700'}`}></div>
                          <span className="text-sm font-black text-white">
                            {day.minutes > 0 ? `${Math.floor(day.minutes)} mins` : 'Rest Day'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 md:mt-6 text-[10px] font-bold text-neutral-600 uppercase tracking-widest justify-start md:pl-[54px]">
        <span>Less</span>
        <div className="flex gap-1.5 align-middle">
          <div className="w-3 h-3 rounded-[3px] bg-neutral-900 border border-neutral-800/50"></div>
          <div className="w-3 h-3 rounded-[3px] bg-emerald-950 border border-emerald-900"></div>
          <div className="w-3 h-3 rounded-[3px] bg-emerald-800 border border-emerald-700"></div>
          <div className="w-3 h-3 rounded-[3px] bg-emerald-600 border border-emerald-500"></div>
          <div className="w-3 h-3 rounded-[3px] bg-emerald-400 border border-emerald-300"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
