"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { upload } from '@vercel/blob/client';
import type { WorkoutDefinition } from "@/lib/workoutData";

const COLORS = [
  { name: "Emerald", value: "bg-emerald-500" },
  { name: "Rose", value: "bg-rose-500" },
  { name: "Indigo", value: "bg-indigo-500" },
  { name: "Cyan", value: "bg-cyan-500" },
  { name: "Amber", value: "bg-amber-500" },
];

const ICONS = ["Dumbbell", "Repeat", "Mountain", "Activity", "Flame"];

export default function CreateWorkoutModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void, 
  onSave: (workout: WorkoutDefinition) => void 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorError, setError] = useState("");
  const inputFileRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [iconName, setIconName] = useState(ICONS[0]);
  const [prepTime, setPrepTime] = useState(10);
  const [sets, setSets] = useState(1);
  const [repsPerSet, setRepsPerSet] = useState(1);
  const [workTime, setWorkTime] = useState(10);
  const [restTime, setRestTime] = useState(0);
  const [longRestTime, setLongRestTime] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description) {
      setError("Title and Description are required.");
      return;
    }

    if (!inputFileRef.current?.files?.length) {
      setError("Please select a thumbnail image.");
      return;
    }

    try {
      setIsUploading(true);
      
      const file = inputFileRef.current?.files?.[0];
      if (!file) {
        throw new Error("No file selected.");
      }

      // Upload directly to Vercel Blob with private access constraint and client payload for folder structure
      const uid = localStorage.getItem("ascend_user_id") || 'unknown_user';
      const targetPath = `users/${uid}/images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const newBlob = await upload(targetPath, file, {
        access: 'private',
        handleUploadUrl: '/api/upload',
        clientPayload: uid,
      });

      // Construct the workout
      const newWorkout: WorkoutDefinition = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        color,
        iconName,
        prepTime,
        sets,
        repsPerSet,
        workTime,
        restTime,
        longRestTime,
        imageUrl: newBlob.url,
      };

      onSave(newWorkout);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. Make sure Vercel Blob is configured correctly.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
          <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Custom Workout</h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-full transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <form id="create-workout" onSubmit={handleSubmit} className="space-y-8">
            
            {errorError && (
              <div className="p-4 bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl font-medium">
                {errorError}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Workout Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Weighted Pull-ups" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your goals and reps for this workout..." 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors h-24 resize-none font-medium"
                />
              </div>
            </div>

            {/* Aesthetics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Accent Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-full ${c.value} ${color === c.value ? 'ring-4 ring-white shadow-[0_0_15px_currentColor]' : 'ring-2 ring-transparent opacity-50 hover:opacity-100'} transition-all`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Theme Icon</label>
                <select 
                  value={iconName} 
                  onChange={e => setIconName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none font-medium"
                >
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            {/* Timing & Structure */}
            <div className="bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Interval Structure</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <NumberInput label="Sets" value={sets} onChange={setSets} min={1} />
                <NumberInput label="Reps per Set" value={repsPerSet} onChange={setRepsPerSet} min={1} />
                <NumberInput label="Work Time (s)" value={workTime} onChange={setWorkTime} min={1} />
                <NumberInput label="Short Rest (s)" value={restTime} onChange={setRestTime} min={0} />
                <NumberInput label="Long Rest (s)" value={longRestTime} onChange={setLongRestTime} min={0} />
                <NumberInput label="Prep Time (s)" value={prepTime} onChange={setPrepTime} min={1} />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Thumbnail Image</label>
              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  ref={inputFileRef}
                  accept="image/jpeg, image/png, image/webp" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-neutral-950 border border-dashed border-neutral-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-500 group-hover:bg-emerald-500/5 transition-all">
                  <ImageIcon className="w-10 h-10 mb-3 group-hover:text-emerald-500 transition-colors" />
                  <p className="font-medium text-center">Click or Drag to Upload Image</p>
                  <p className="text-xs uppercase tracking-wider mt-1 opacity-60 text-center text-neutral-500">JPG, PNG, WEBP (Max 4.5MB)</p>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900 shrink-0">
          <button 
            type="submit" 
            form="create-workout"
            disabled={isUploading}
            className="w-full py-4 rounded-xl text-lg font-black uppercase tracking-widest text-black bg-white hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_theme(colors.white)]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Save Workout
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min }: { label: string, value: number, onChange: (v: number) => void, min: number }) {
  return (
    <div>
      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 px-1">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || min)}
        min={min}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
      />
    </div>
  );
}
