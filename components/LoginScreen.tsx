"use client";

import { useState } from "react";
import { Loader2, ArrowRight, Dumbbell, Zap, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginScreen({ onLogin }: { onLogin: (uid: string, username: string) => void }) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorError, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      onLogin(data.uuid, data.username);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-neutral-950 text-white relative overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity scale-105"
          style={{ backgroundImage: 'url(/assets/background.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/20" />
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
        
        {/* Left Side: Marketing & Value Proposition */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left pt-10"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold tracking-widest uppercase text-xs mb-6">
            Train Smarter, Climb Harder
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black italic tracking-tighter text-white mb-6 uppercase drop-shadow-2xl leading-none">
            Ascend
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-medium tracking-wide mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            The ultimate chalk-friendly timer. Build custom hangboard protocols, log your endurance sets, and track your progress natively.
          </p>

          <div className="space-y-6 text-left hidden md:block">
            <FeatureRow icon={<Dumbbell className="w-5 h-5 text-emerald-500" />} title="Custom Workouts" desc="Build unlimited personalized timers." />
            <FeatureRow icon={<Zap className="w-5 h-5 text-amber-500" />} title="Chalk-Friendly UI" desc="Massive, high-contrast visual cues." />
            <FeatureRow icon={<Fingerprint className="w-5 h-5 text-indigo-500" />} title="Passwordless" desc="Just type your name to instantly sync." />
          </div>
        </motion.div>
        
        {/* Right Side: The Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md w-full"
        >
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2 text-center">Claim your profile</h2>
            <p className="text-neutral-500 text-center mb-8 font-medium">No signup required. Pick a unique username to save your workout data.</p>
            
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {errorError && (
                 <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-medium text-center text-sm">
                   {errorError}
                 </div>
              )}

              <div className="relative group">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. adam_ondra" 
                  className="w-full bg-neutral-950/50 border-2 border-neutral-800 rounded-2xl py-5 px-6 text-xl font-bold text-white placeholder-neutral-700 focus:outline-none focus:border-emerald-500 transition-all"
                  autoComplete="off"
                  spellCheck="false"
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                disabled={!username.trim() || isLoading}
                className="w-full py-5 rounded-2xl text-xl font-black uppercase tracking-widest text-black bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_theme(colors.emerald.500)] disabled:shadow-none active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Start Training <ArrowRight className="w-6 h-6" /></>}
              </button>
            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-bold tracking-wide">{title}</h3>
        <p className="text-neutral-500 text-sm">{desc}</p>
      </div>
    </div>
  );
}
