'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Dumbbell, Utensils, ChefHat, ChevronRight, Flame, Trophy } from 'lucide-react';
import { authAPI } from '@/lib/api';

const API_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://fitmood-backend.onrender.com'
    : 'http://127.0.0.1:8000';

const QUICK_ACTIONS = [
  { title: 'Get Workout', sub: 'Mood-based training', icon: Dumbbell, path: '/select-age' },
  { title: 'Meal Plans', sub: '7-day strategy', icon: Utensils, path: '/nutrition?tab=meal-plan' },
  { title: 'Recipes', sub: 'Personalized ideas', icon: ChefHat, path: '/nutrition?tab=recipes' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setMounted(true);
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);

    // Fetch streak + workouts from backend using the stored token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data) setProfile(data);
        })
        .catch(() => {
          // silently ignore — streak just won't show
        });
    }
  }, [router]);

  const userName = mounted ? (user?.email?.split('@')[0] || 'Member') : 'Member';
  const streak = profile?.streak ?? 0;
  const totalWorkouts = profile?.workouts ?? 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FB923C]"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F9FC] text-[#1F2937]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold text-[#1F2937] tracking-[0.05em] mb-3">
            WELCOME BACK, <span className="text-[#FB923C] uppercase">{userName}</span>! 👋
          </h1>
          <p className="text-[#6B7280] font-medium tracking-wide">Choose your path for today's objective.</p>
        </header>

        {/* ── Streak + Stats Row ── */}
        <section className="mb-12">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 text-[#6B7280]">Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Streak Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-7 flex items-center gap-5 border-2 border-transparent hover:border-[#FB923C]/20 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                <Flame size={28} className="text-[#FB923C]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B7280] mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-[#1F2937] leading-none">
                  {streak}
                  <span className="text-lg font-semibold text-[#FB923C] ml-1">day{streak !== 1 ? 's' : ''}</span>
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  {streak === 0
                    ? 'Complete a workout to start your streak!'
                    : streak >= 7
                    ? '🔥 You\'re on fire! Keep it up!'
                    : 'Keep going — don\'t break the chain!'}
                </p>
              </div>
            </motion.div>

            {/* Total Workouts Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-7 flex items-center gap-5 border-2 border-transparent hover:border-[#FB923C]/20 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                <Trophy size={28} className="text-[#FB923C]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B7280] mb-1">Total Workouts</p>
                <p className="text-4xl font-bold text-[#1F2937] leading-none">
                  {totalWorkouts}
                  <span className="text-lg font-semibold text-[#FB923C] ml-1">session{totalWorkouts !== 1 ? 's' : ''}</span>
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  {totalWorkouts === 0
                    ? 'Your fitness journey starts now!'
                    : totalWorkouts >= 20
                    ? '🏆 Fitness veteran status!'
                    : 'Every session counts!'}
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-[#6B7280]">Quick Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_ACTIONS.map((action, idx) => (
              <motion.div
                key={idx}
                whileHover={{ translateY: -4 }}
                onClick={() => router.push(action.path)}
                className="group bg-white p-8 rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-2 border-transparent hover:border-[#FB923C]/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FC] text-[#FB923C] flex items-center justify-center mb-6">
                  <action.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937] tracking-tight mb-2 uppercase">{action.title}</h3>
                <p className="text-[#6B7280] text-sm font-medium mb-6">{action.sub}</p>
                <div className="flex items-center gap-2 text-[#FB923C] font-bold text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all">
                  Initialize <ChevronRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}