'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Moon, Wind, Trophy, Smile,
  Clock, Dumbbell, Flame, ExternalLink, Info,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { authAPI, workoutAPI } from '@/lib/api';

const MOODS = [
  { id: 'energetic', label: 'Energetic', icon: Zap },
  { id: 'tired',     label: 'Tired',     icon: Moon },
  { id: 'stressed',  label: 'Stressed',  icon: Wind },
  { id: 'motivated', label: 'Motivated', icon: Trophy },
  { id: 'happy',     label: 'Happy',     icon: Smile },
];

const AGE_BADGE_COLORS = {
  teen:        { bg: '#ECFDF5', text: '#065F46', border: '#34D399' },
  young_adult: { bg: '#FFF7ED', text: '#92400E', border: '#FB923C' },
  adult:       { bg: '#EFF6FF', text: '#1E40AF', border: '#60A5FA' },
  senior:      { bg: '#F5F3FF', text: '#4C1D95', border: '#A78BFA' },
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function WorkoutsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [selectedMood,     setSelectedMood]     = useState('energetic');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [workout,          setWorkout]          = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);

  const ageCategory = searchParams.get('age') || 'young_adult';
  const ageBadge    = AGE_BADGE_COLORS[ageCategory] || AGE_BADGE_COLORS.young_adult;

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) router.push('/login');
  }, [router]);

  const handleFetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    setWorkout(null);
    try {
      const response = await workoutAPI.getWorkoutsByMood({
        mood:           selectedMood,
        available_time: selectedDuration,
        age_category:   ageCategory,
      });
      setWorkout(response);

      // Save mood to database
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        await fetch(`${API}/auth/update-mood`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email, mood: selectedMood }),
        });
      }
    } catch (err) {
      setError('Failed to generate workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-[0.05em] mb-3 text-[#1F2937]">
          OPTIMIZE YOUR <span className="text-[#FB923C]">SESSION</span>
        </h1>
        <p className="text-[#6B7280] font-medium tracking-wide uppercase text-[10px] mb-4">
          Select state to initialize protocol
        </p>
        <div className="flex items-center justify-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border"
            style={{ background: ageBadge.bg, color: ageBadge.text, borderColor: ageBadge.border }}
          >
            {ageCategory.replace('_', ' ')}
            <span className="opacity-60 font-normal normal-case tracking-normal">· Workouts calibrated for your age</span>
          </span>
          <button
            onClick={() => router.push('/select-age')}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            <Info size={14} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
        {MOODS.map((m) => {
          const Icon = m.icon;
          const isActive = selectedMood === m.id;
          return (
            <motion.button
              key={m.id}
              whileHover={{ translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMood(m.id)}
              className={`flex flex-col items-center justify-center p-8 rounded-[2rem] bg-white transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-2 border-[#FB923C] shadow-lg scale-[1.02]'
                  : 'border-2 border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
              }`}
            >
              <Icon size={28} className={isActive ? 'text-[#FB923C]' : 'text-[#6B7280]'} />
              <span className={`mt-4 text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-10">
        <div className="flex items-center gap-2 mb-6 text-[#1F2937]">
          <Clock size={16} />
          <h3 className="font-bold text-xs uppercase tracking-widest">Time Allocation</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {[10, 15, 20, 30, 45, 60].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`px-8 py-3 rounded-xl font-bold text-xs transition-all ${
                selectedDuration === d
                  ? 'bg-[#1F2937] text-white'
                  : 'bg-[#F8F9FC] text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {d} MIN
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleFetchWorkouts}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#FB923C] to-[#F97316] text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(249,115,22,0.3)] disabled:opacity-60"
      >
        {loading ? 'Analyzing...' : 'Initialize Workout'}
      </motion.button>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <AnimatePresence>
        {workout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-16 space-y-6"
          >
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#1F2937]">{workout.title}</h2>
                  <p className="text-[#6B7280] text-sm mt-1">{workout.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <span className="px-3 py-1 bg-[#F8F9FC] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                    {workout.duration_minutes} MIN
                  </span>
                  <span className="px-3 py-1 bg-[#FFF3CD] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#B45309]">
                    {workout.mood}
                  </span>
                </div>
              </div>
              {workout.calories_burned && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FB923C] to-[#F97316] rounded-xl shrink-0">
                    <Flame size={14} className="text-white" />
                    <span className="text-white font-bold text-xs uppercase tracking-widest">
                      {workout.calories_burned.estimated_range} Burned
                    </span>
                  </div>
                  <span className="text-[#9CA3AF] text-[11px]">{workout.calories_burned.note}</span>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#1F2937] mb-6 flex items-center gap-2">
                <Dumbbell size={14} /> Exercises
              </h3>
              <div className="space-y-3">
                {workout.exercises.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 bg-[#F8F9FC] rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-7 h-7 flex items-center justify-center bg-[#FB923C] text-white text-xs font-bold rounded-full">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-sm text-[#1F2937]">{ex.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                        {ex.sets} sets · {ex.reps_or_duration}
                      </span>
                      {ex.approx_calories && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-[#FFF3CD] rounded-lg text-[10px] font-bold text-[#B45309]">
                          <Flame size={10} /> ~{ex.approx_calories} kcal
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => workout.youtube_url && window.open(workout.youtube_url, '_blank')}
              className="w-full bg-[#FF0000] text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(255,0,0,0.25)] flex items-center justify-center gap-3"
            >
              <ExternalLink size={18} /> Watch on YouTube
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorkoutsPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FC] text-[#1F2937]">
      <Navbar />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FB923C]"></div>
        </div>
      }>
        <WorkoutsContent />
      </Suspense>
    </main>
  );
}