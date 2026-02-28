import { useState } from "react";
import { WorkoutDefinition, WorkoutLog } from "@/lib/workoutData";
import { CheckCircle2, Flame, Loader2 } from "lucide-react";

export default function WorkoutCompleteSummary({
  workout,
  durationSeconds,
  onSave,
  onDiscard
}: {
  workout: WorkoutDefinition;
  durationSeconds: number;
  onSave: (log: Omit<WorkoutLog, 'id' | 'date'>) => Promise<void>;
  onDiscard: () => void;
}) {
  const [rpe, setRpe] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // RPE Scale definitions
  const rpeLabels: Record<number, string> = {
    1: "Very Light", 2: "Light", 3: "Moderate", 4: "Somewhat Hard",
    5: "Hard", 6: "Noticeably Hard", 7: "Very Hard", 8: "Extremely Hard",
    9: "Maximal Effort", 10: "Absolute Failure"
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      workoutId: workout.id,
      title: workout.title,
      durationSeconds,
      rpe,
      notes
    });
    // Modal will be unmounted by parent state change
  };

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Success Header Area */}
        <div className="flex flex-col items-center justify-center mb-8 shrink-0">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2 text-center">Workout Complete</h2>
          <p className="text-neutral-400 font-medium text-center">
            You trained for <span className="text-white font-bold">{minutes}m {seconds.toString().padStart(2, '0')}s</span>
          </p>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-8">
          
          {/* RPE Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Intensity (RPE)
              </label>
              <div className="px-3 py-1 bg-neutral-800 rounded-full text-xs font-bold text-white shadow-sm">
                RPE {rpe}
              </div>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={rpe} 
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
              <span>Light (1)</span>
              <span className="text-white bg-neutral-800/50 px-2 py-0.5 rounded-md">{rpeLabels[rpe]}</span>
              <span>Max (10)</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
             <label className="text-sm font-bold text-neutral-300 uppercase tracking-widest">
                Session Notes
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the grips feel? Did you hit failure?"
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none h-32"
              />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-8 shrink-0">
          <button 
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-neutral-400 bg-neutral-800/50 hover:bg-neutral-800 disabled:opacity-50 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-black bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_-10px_theme(colors.emerald.500)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save to Log"}
          </button>
        </div>

      </div>
    </div>
  );
}
