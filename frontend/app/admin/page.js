'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, Dumbbell, TrendingUp, LogOut,
  ShieldCheck, RefreshCw, Activity,
} from 'lucide-react';

const MOOD_COLORS = {
  energetic: '#FB923C', stressed: '#60A5FA', happy: '#34D399',
  tired: '#A78BFA', motivated: '#F59E0B', sad: '#F87171',
  anxious: '#E879F9', neutral: '#6B7280',
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/admin/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Could not load users. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const totalWorkouts = users.reduce((sum, u) => sum + (u.workouts || 0), 0);
  const avgWorkouts = totalUsers ? (totalWorkouts / totalUsers).toFixed(1) : 0;
  const moodCounts = users.reduce((acc, u) => {
    if (u.lastMood) acc[u.lastMood] = (acc[u.lastMood] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const STATS = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: '#FB923C' },
    { label: 'Total Workouts', value: totalWorkouts, icon: Dumbbell, color: '#34D399' },
    { label: 'Avg / User', value: avgWorkouts, icon: TrendingUp, color: '#60A5FA' },
    { label: 'Top Mood', value: topMood, icon: Activity, color: '#A78BFA' },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <main className="min-h-screen bg-[#1F2937] text-white">
      <nav className="bg-[#111827] border-b border-[#374151] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FB923C] flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">FitMood Admin</h1>
            <p className="text-[10px] text-[#6B7280] uppercase tracking-widest">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-[#374151]"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider transition-colors border border-red-500/20"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-[#111827] rounded-2xl p-6 border border-[#374151]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: stat.color + '20' }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-black text-white mb-1 capitalize">{stat.value}</p>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {Object.keys(moodCounts).length > 0 && (
          <div className="bg-[#111827] rounded-2xl border border-[#374151] p-6 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-4">
              Mood Distribution
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(moodCounts).map(([mood, count]) => (
                <div
                  key={mood}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: (MOOD_COLORS[mood] || '#6B7280') + '20',
                    color: MOOD_COLORS[mood] || '#6B7280',
                    border: `1px solid ${MOOD_COLORS[mood] || '#6B7280'}40`,
                  }}
                >
                  {mood}
                  <span className="opacity-70">{count} users</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#111827] rounded-2xl border border-[#374151] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#374151]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
              All Users ({totalUsers})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#6B7280]">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280]">No users registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    {['#', 'Name', 'Email', 'Joined', 'DOB'].map((col) => (
                      <th
                        key={col}
                        className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-[#1F2937] hover:bg-[#1F2937] transition-colors"
                    >
                      <td className="px-6 py-4 text-[#6B7280] text-sm">{i + 1}</td>
                      <td className="px-6 py-4 text-white text-sm font-medium">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-[#9CA3AF] text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-[#9CA3AF] text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 text-[#9CA3AF] text-sm">{user.dob || 'N/A'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}