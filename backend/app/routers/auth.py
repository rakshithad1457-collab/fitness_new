'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Dumbbell, TrendingUp, LogOut,
  ShieldCheck, RefreshCw, Activity, Trash2, Pencil, Plus, X, Check,
} from 'lucide-react';

const MOOD_COLORS = {
  energetic: '#FB923C', stressed: '#60A5FA', happy: '#34D399',
  tired: '#A78BFA', motivated: '#F59E0B', sad: '#F87171',
  anxious: '#E879F9', neutral: '#6B7280',
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const INPUT = "w-full bg-[#0f172a] border border-[#374151] rounded-xl px-3 py-2 text-sm text-white placeholder-[#4B5563] outline-none focus:border-[#FB923C] transition-colors";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', dob: '', email: '', password: '' });
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/admin/users`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setError('Could not load users. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleDelete = async (email) => {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      const res = await fetch(`${API}/auth/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setUsers(u => u.filter(x => x.email !== email));
      flash('User deleted ✓');
    } catch {
      flash('Delete failed ✗');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.email);
    setEditForm({ name: user.name || '', dob: user.dob || '', lastMood: user.lastMood || 'neutral' });
  };

  const handleEditSave = async (email) => {
    try {
      const res = await fetch(`${API}/auth/admin/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setUsers(u => u.map(x => x.email === email ? { ...x, ...editForm } : x));
      setEditingUser(null);
      flash('User updated ✓');
    } catch {
      flash('Update failed ✗');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API}/auth/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setShowCreate(false);
      setCreateForm({ name: '', dob: '', email: '', password: '' });
      flash('User created ✓');
      fetchUsers();
    } catch (e) {
      flash(e.message || 'Create failed ✗');
    }
  };

  const totalUsers = users.length;
  const totalWorkouts = users.reduce((s, u) => s + (u.workouts || 0), 0);
  const avgWorkouts = totalUsers ? (totalWorkouts / totalUsers).toFixed(1) : 0;
  const moodCounts = users.reduce((acc, u) => { if (u.lastMood) acc[u.lastMood] = (acc[u.lastMood] || 0) + 1; return acc; }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const STATS = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: '#FB923C' },
    { label: 'Total Workouts', value: totalWorkouts, icon: Dumbbell, color: '#34D399' },
    { label: 'Avg / User', value: avgWorkouts, icon: TrendingUp, color: '#60A5FA' },
    { label: 'Top Mood', value: topMood, icon: Activity, color: '#A78BFA' },
  ];

  return (
    <main className="min-h-screen bg-[#1F2937] text-white">
      {/* Navbar */}
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
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FB923C]/10 text-[#FB923C] hover:bg-[#FB923C]/20 text-xs font-bold uppercase tracking-wider transition-colors border border-[#FB923C]/20">
            <Plus size={13} /> Add User
          </button>
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F2937] text-[#9CA3AF] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-[#374151]">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin/login'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider transition-colors border border-red-500/20">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Flash message */}
        <AnimatePresence>
          {actionMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-4 p-3 rounded-xl text-sm text-center font-bold ${actionMsg.includes('✓') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {actionMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-[#111827] rounded-2xl p-6 border border-[#374151]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.color + '20' }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-black text-white mb-1 capitalize">{stat.value}</p>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="bg-[#111827] rounded-2xl border border-[#374151] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#374151]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">All Users ({totalUsers})</h2>
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
                    {['#', 'Name', 'Email', 'DOB', 'Mood', 'Workouts', 'Actions'].map(col => (
                      <th key={col} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr key={user.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-[#1F2937] hover:bg-[#1a2332] transition-colors">
                      <td className="px-6 py-4 text-[#6B7280] text-sm">{i + 1}</td>

                      {/* Name */}
                      <td className="px-6 py-4 text-sm">
                        {editingUser === user.email
                          ? <input className={INPUT} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          : <span className="text-white font-medium">{user.name || 'N/A'}</span>}
                      </td>

                      <td className="px-6 py-4 text-[#9CA3AF] text-sm">{user.email}</td>

                      {/* DOB */}
                      <td className="px-6 py-4 text-sm">
                        {editingUser === user.email
                          ? <input type="date" className={INPUT} value={editForm.dob} onChange={e => setEditForm(f => ({ ...f, dob: e.target.value }))} />
                          : <span className="text-[#9CA3AF]">{user.dob || 'N/A'}</span>}
                      </td>

                      {/* Mood */}
                      <td className="px-6 py-4 text-sm">
                        {editingUser === user.email
                          ? <select className={INPUT} value={editForm.lastMood} onChange={e => setEditForm(f => ({ ...f, lastMood: e.target.value }))}>
                              {Object.keys(MOOD_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          : <span className="px-2 py-1 rounded-lg text-xs font-bold uppercase"
                              style={{ background: (MOOD_COLORS[user.lastMood] || '#6B7280') + '20', color: MOOD_COLORS[user.lastMood] || '#6B7280' }}>
                              {user.lastMood || 'N/A'}
                            </span>}
                      </td>

                      <td className="px-6 py-4 text-[#9CA3AF] text-sm">{user.workouts || 0}</td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {editingUser === user.email ? (
                            <>
                              <button onClick={() => handleEditSave(user.email)}
                                className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20">
                                <Check size={13} />
                              </button>
                              <button onClick={() => setEditingUser(null)}
                                className="p-2 rounded-lg bg-[#374151] text-[#9CA3AF] hover:text-white transition-colors">
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(user)}
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => handleDelete(user.email)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] rounded-2xl p-8 w-full max-w-md border border-[#374151]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Add New User</h2>
                <button onClick={() => setShowCreate(false)} className="text-[#6B7280] hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1 block">Full Name</label>
                  <input className={INPUT} placeholder="John Doe" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1 block">Date of Birth</label>
                  <input type="date" className={INPUT} value={createForm.dob} onChange={e => setCreateForm(f => ({ ...f, dob: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1 block">Email</label>
                  <input type="email" className={INPUT} placeholder="user@example.com" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1 block">Password</label>
                  <input type="password" className={INPUT} placeholder="••••••••" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <button onClick={handleCreate}
                  className="w-full bg-gradient-to-r from-[#FB923C] to-[#F97316] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-sm mt-2">
                  Create User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}