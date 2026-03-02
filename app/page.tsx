"use client";

import { useState, useEffect } from "react";
import { WORKOUT_LIBRARY, WorkoutDefinition } from "@/lib/workoutData";
import WorkoutCard from "@/components/WorkoutCard";
import WorkoutDetail from "@/components/WorkoutDetail";
import ActiveTimer from "@/components/ActiveTimer";
import CreateWorkoutModal from "@/components/CreateWorkoutModal";
import LoginScreen from "@/components/LoginScreen";
import StatsDashboard from "@/components/StatsDashboard";
import BadCounter from "@/components/BadCounter";
import { Plus, User, LogOut, BarChart2, Dumbbell } from "lucide-react";

export default function Home() {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDefinition | null>(null);
  const [timerWorkout, setTimerWorkout] = useState<WorkoutDefinition | null>(null);
  
  // Custom Workouts State (Vercel Blob)
  const [customWorkouts, setCustomWorkouts] = useState<WorkoutDefinition[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'workouts' | 'stats'>('workouts');

  // Check LocalStorage for existing session token
  useEffect(() => {
    try {
      const uid = localStorage.getItem("ascend_user_id");
      const uname = localStorage.getItem("ascend_username");
      
      if (uid && uname) {
        setUserId(uid);
        setUsername(uname);
        fetchWorkouts(uid);
      } else {
        setIsCheckingAuth(false);
      }
    } catch (e) {
      console.error("Failed to initialize user session", e);
      setIsCheckingAuth(false);
    }
  }, []);

  const fetchWorkouts = (uid: string) => {
    fetch(`/api/workouts?userId=${uid}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.workouts && Array.isArray(data.workouts)) {
            setCustomWorkouts(data.workouts);
          }
          setIsCheckingAuth(false);
        })
        .catch(e => {
          console.error("Failed to load blob workouts", e);
          setIsCheckingAuth(false);
        });
  };

  const handleLogin = (uid: string, uname: string) => {
    localStorage.setItem("ascend_user_id", uid);
    localStorage.setItem("ascend_username", uname);
    setUserId(uid);
    setUsername(uname);
    setIsCheckingAuth(true); // show spinner briefly while fetching
    fetchWorkouts(uid);
  };

  const handleLogout = () => {
    localStorage.removeItem("ascend_user_id");
    localStorage.removeItem("ascend_username");
    setUserId('');
    setUsername('');
    setCustomWorkouts([]);
  };

  const handleSaveCustomWorkout = async (newWorkout: WorkoutDefinition) => {
    const updated = [newWorkout, ...customWorkouts];
    setCustomWorkouts(updated);
    setIsCreateModalOpen(false);

    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, workouts: updated })
      });
    } catch (e) {
      console.error("Failed to save workouts to Vercel Blob", e);
    }
  };

  const allWorkouts = [...customWorkouts, ...WORKOUT_LIBRARY];

  // Global App Loading Gate
  if (isCheckingAuth) {
    return (
      <div className="min-h-[100dvh] bg-neutral-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-neutral-500 mt-4 font-medium uppercase tracking-widest text-sm">Syncing Data...</p>
      </div>
    );
  }

  // Login Gate
  if (!userId) {
    return <LoginScreen onLogin={handleLogin} />;
  }

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
          <div className="max-w-6xl mx-auto px-6 py-6 animate-in fade-in duration-500 pb-20">
            
            {/* Top Auth Header */}
            <div className="w-full flex justify-end mb-6 md:mb-10 items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-white text-sm font-bold tracking-wide shadow-sm">
                <User className="w-4 h-4 text-emerald-500" />
                <span>{username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-full text-neutral-500 hover:text-red-400 transition-all text-sm font-medium"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>

            <header className="mb-10 md:mb-14 text-center md:text-left flex flex-col items-center md:items-start">
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-3 md:mb-4 uppercase drop-shadow-lg">Ascend</h1>
              <p className="text-neutral-400 text-lg md:text-xl font-medium tracking-wide mb-8">Professional Climbing Workouts</p>
              
              {/* Modern Segmented Tab Control */}
              <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm">
                 <button 
                   onClick={() => setActiveTab('workouts')}
                   className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'workouts' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50'}`}
                 >
                   <Dumbbell className="w-4 h-4" /> Workouts
                 </button>
                 <button 
                   onClick={() => setActiveTab('stats')}
                   className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'stats' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50'}`}
                 >
                   <BarChart2 className="w-4 h-4" /> My Stats
                 </button>
              </div>
            </header>

            {/* Render Context Based on Tab */}
            {activeTab === 'workouts' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* Create Custom Workout Card */}
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group relative w-full h-56 md:h-64 rounded-[2.5rem] bg-neutral-900 border border-dashed border-neutral-700 hover:border-emerald-500 overflow-hidden text-left transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] focus:outline-none flex flex-col items-center justify-center p-8 active:scale-[0.98]"
                >
                  <div className="w-16 h-16 rounded-full bg-neutral-800 group-hover:bg-emerald-500 flex items-center justify-center mb-4 transition-colors duration-500">
                    <Plus className="w-8 h-8 text-neutral-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider text-center">Create Custom Workout</h3>
                  <p className="text-neutral-500 font-medium text-sm mt-2 text-center">Add your own protocol</p>
                </button>

                {allWorkouts.map((workout) => (
                  <WorkoutCard 
                    key={workout.id} 
                    workout={workout} 
                    onClick={() => setActiveWorkout(workout)} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <BadCounter />
                <StatsDashboard />
              </div>
            )}
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

        {/* Custom Workout Modal */}
        {isCreateModalOpen && (
          <CreateWorkoutModal 
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSaveCustomWorkout}
          />
        )}
      </div>
    </main>
  );
}
