'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Dumbbell, TrendingUp, LogOut, ShieldCheck,
  RefreshCw, Activity, Trash2, Pencil, Plus, X, Check,
  Search, ChevronUp, ChevronDown, Download, Mail, Clock,
  BarChart2, List, Flame,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const MOOD_COLORS = {
  energetic: '#F97316', stressed: '#3B82F6', happy: '#22C55E',
  tired: '#8B5CF6', motivated: '#EAB308', sad: '#EF4444',
  anxious: '#EC4899', neutral: '#6B7280',
};

const AGE_COLORS = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6'];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const INP = "w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-white placeholder-[#484F58] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', dob: '', email: '', password: '' });
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [activityModal, setActivityModal] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [uRes, sRes] = await Promise.all([
        fetch(`${API}/auth/admin/users`),
        fetch(`${API}/auth/admin/stats`),
      ]);
      if (!uRes.ok) throw new Error();
      setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch {
      setError('Unable to reach backend. Please check if the server is running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) list = list.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? '';
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return list;
  }, [users, search, sortKey, sortDir]);

  const handleDelete = async (email) => {
    try {
      const res = await fetch(`${API}/auth/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setUsers(u => u.filter(x => x.email !== email));
      setDeleteConfirm(null);
      showToast('User deleted successfully');
    } catch { showToast('Failed to delete user', 'error'); }
  };

  const handleEditSave = async (email) => {
    try {
      const res = await fetch(`${API}/auth/admin/users/${encodeURIComponent(email)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setUsers(u => u.map(x => x.email === email ? { ...x, ...editForm } : x));
      setEditingUser(null); showToast('User updated successfully');
    } catch { showToast('Failed to update user', 'error'); }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API}/auth/admin/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setShowCreate(false); setCreateForm({ name: '', dob: '', email: '', password: '' });
      showToast('User created successfully'); fetchData();
    } catch (e) { showToast(e.message || 'Failed to create user', 'error'); }
  };

  const handleSendEmail = async () => {
    try {
      const res = await fetch(`${API}/auth/admin/email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailModal.email, ...emailForm }),
      });
      if (!res.ok) throw new Error();
      setEmailModal(null); setEmailForm({ subject: '', body: '' });
      showToast(`Email sent to ${emailModal.email}`);
    } catch { showToast('Failed to send email', 'error'); }
  };

  const exportCSV = () => {
    const rows = [['ID', 'Name', 'Email', 'Age', 'DOB', 'Joined', 'Last Login', 'Workouts', 'Streak', 'Mood']];
    users.forEach(u => rows.push([u.id, u.name, u.email, u.age ?? 'N/A', u.dob, u.joined, u.last_login, u.workouts, u.streak ?? 0, u.lastMood]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'fitmood_users.csv'; a.click();
  };

  // ── Chart data ──────────────────────────────────────────────────────────────

  // Mood distribution (existing)
  const moodChartData = stats
    ? Object.entries(stats.mood_counts || {}).map(([mood, count]) => ({ mood, count, fill: MOOD_COLORS[mood] || '#6B7280' }))
    : [];

  // Registration growth (existing)
  const regChartData = stats
    ? Object.entries(stats.registrations_by_date || {})
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }))
    : [];

  // Workout activity over time (NEW) — from workout_log aggregated on backend
  const workoutTrendData = stats
    ? Object.entries(stats.workout_trend || {})
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }))
    : [];

  // Age group distribution (NEW)
  const ageGroupData = stats
    ? Object.entries(stats.age_groups || {}).map(([group, count], i) => ({
        group,
        count,
        fill: AGE_COLORS[i] || '#6B7280',
      }))
    : [];

  // Streak leaderboard (NEW)
  const streakLeaderData = stats ? (stats.streak_leaders || []) : [];

  // ── Summary numbers ─────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const totalWorkouts = users.reduce((s, u) => s + (u.workouts || 0), 0);
  const avgWorkouts = totalUsers ? (totalWorkouts / totalUsers).toFixed(1) : 0;
  const topMood = stats?.top_mood || '—';
  const topStreak = users.length > 0 ? Math.max(...users.map(u => u.streak || 0)) : 0;

  const STATS = [
    { label: 'Total Users',    value: totalUsers,    icon: Users,     color: '#F97316', bg: '#F9731610' },
    { label: 'Total Workouts', value: totalWorkouts, icon: Dumbbell,  color: '#22C55E', bg: '#22C55E10' },
    { label: 'Avg per User',   value: avgWorkouts,   icon: TrendingUp,color: '#3B82F6', bg: '#3B82F610' },
    { label: 'Top Mood',       value: topMood,       icon: Activity,  color: '#8B5CF6', bg: '#8B5CF610' },
    { label: 'Best Streak',    value: `${topStreak}d`, icon: Flame,   color: '#F97316', bg: '#F9731610' },
  ];

  const SortIcon = ({ col }) => sortKey === col
    ? (sortDir === 'asc' ? <ChevronUp size={12} className="text-[#F97316]" /> : <ChevronDown size={12} className="text-[#F97316]" />)
    : <ChevronUp size={12} className="text-[#484F58]" />;

  const TABS = [
    { id: 'users',     label: 'Users',     icon: List },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const tooltipStyle = { background: '#161B22', border: '1px solid #30363D', borderRadius: 8, fontSize: 12 };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#161B22] border-b border-[#30363D] px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center shadow-lg shadow-[#F97316]/20">
            <ShieldCheck size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">FitMood</p>
            <p className="text-[10px] text-[#484F58] mt-0.5">Admin Console</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-xs font-medium transition-all border border-[#30363D]">
            <Download size={12} /> Export CSV
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA6C0A] text-white text-xs font-medium transition-all shadow-lg shadow-[#F97316]/20">
            <Plus size={12} /> Add User
          </button>
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-xs font-medium transition-all border border-[#30363D]">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <div className="w-px h-5 bg-[#30363D] mx-1" />
          <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin/login'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-[#8B949E] hover:text-red-400 text-xs font-medium transition-all">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {error && <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm text-center">⚠️ {error}</div>}

        {/* Stats Row — now 5 cards (added Best Streak) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 hover:border-[#484F58] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-[#8B949E] font-medium uppercase tracking-wider">{s.label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white capitalize">{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#161B22] border border-[#30363D] rounded-xl p-1 w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20' : 'text-[#8B949E] hover:text-white'}`}>
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── USERS TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Users</h2>
                <p className="text-xs text-[#484F58] mt-0.5">{totalUsers} registered accounts</p>
              </div>
              <div className="relative w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484F58]" />
                <input className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-[#484F58] outline-none focus:border-[#F97316] transition-colors"
                  placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[#484F58] text-sm">Loading users...</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-[#484F58] text-sm">{search ? 'No users match your search.' : 'No users registered yet.'}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#30363D]">
                      {[
                        { label: '#',          key: 'id' },
                        { label: 'User',       key: 'name' },
                        { label: 'Email',      key: 'email' },
                        { label: 'Age',        key: 'age' },
                        { label: 'Last Login', key: 'last_login' },
                        { label: 'Mood',       key: 'lastMood' },
                        { label: 'Workouts',   key: 'workouts' },
                        { label: 'Streak 🔥',  key: 'streak' },
                        { label: 'Actions',    key: null },
                      ].map(col => (
                        <th key={col.label} onClick={() => col.key && handleSort(col.key)}
                          className={`text-left px-5 py-3 text-xs font-semibold text-[#8B949E] uppercase tracking-wider whitespace-nowrap ${col.key ? 'cursor-pointer hover:text-white select-none' : ''}`}>
                          <div className="flex items-center gap-1">{col.label}{col.key && <SortIcon col={col.key} />}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262D]">
                    {filtered.map((user, i) => (
                      <motion.tr key={user.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="hover:bg-[#1C2128] transition-colors group">
                        <td className="px-5 py-3.5 text-[#484F58] text-xs">{user.id}</td>
                        <td className="px-5 py-3.5">
                          {editingUser === user.email
                            ? <input className={INP} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                            : <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center text-[#F97316] text-xs font-bold">
                                  {user.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-medium text-white text-xs">{user.name || '—'}</p>
                                  <p className="text-[#484F58] text-[10px]">Joined {user.joined || '—'}</p>
                                </div>
                              </div>
                          }
                        </td>
                        <td className="px-5 py-3.5 text-[#8B949E] text-xs">{user.email}</td>
                        <td className="px-5 py-3.5">
                          {editingUser === user.email
                            ? <input type="date" className={INP} value={editForm.dob} onChange={e => setEditForm(f => ({ ...f, dob: e.target.value }))} />
                            : <span className="text-[#8B949E] text-xs">{user.age != null ? `${user.age} yrs` : '—'}</span>
                          }
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 text-[#484F58] text-xs">
                            <Clock size={10} />
                            {user.last_login || '—'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {editingUser === user.email
                            ? <select className={INP} value={editForm.lastMood} onChange={e => setEditForm(f => ({ ...f, lastMood: e.target.value }))}>
                                {Object.keys(MOOD_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                                style={{ background: (MOOD_COLORS[user.lastMood] || '#6B7280') + '15', color: MOOD_COLORS[user.lastMood] || '#6B7280', border: `1px solid ${MOOD_COLORS[user.lastMood] || '#6B7280'}30` }}>
                                {user.lastMood || '—'}
                              </span>
                          }
                        </td>
                        <td className="px-5 py-3.5 text-[#8B949E] text-xs">{user.workouts ?? 0}</td>

                        {/* ── Streak cell (NEW) ── */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            {(user.streak ?? 0) > 0 && <Flame size={12} className="text-[#F97316]" />}
                            <span className={`text-xs font-semibold ${(user.streak ?? 0) > 0 ? 'text-[#F97316]' : 'text-[#484F58]'}`}>
                              {user.streak ?? 0}d
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {editingUser === user.email ? (
                              <>
                                <button onClick={() => handleEditSave(user.email)}
                                  className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors">
                                  <Check size={12} />
                                </button>
                                <button onClick={() => setEditingUser(null)}
                                  className="p-1.5 rounded-lg bg-[#21262D] text-[#8B949E] hover:text-white border border-[#30363D] transition-colors">
                                  <X size={12} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setActivityModal(user); }}
                                  className="p-1.5 rounded-lg bg-[#21262D] text-[#8B949E] hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/20 border border-[#30363D] transition-colors opacity-0 group-hover:opacity-100"
                                  title="Activity log">
                                  <Clock size={12} />
                                </button>
                                <button onClick={() => { setEmailModal(user); setEmailForm({ subject: 'Message from FitMood', body: '' }); }}
                                  className="p-1.5 rounded-lg bg-[#21262D] text-[#8B949E] hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 border border-[#30363D] transition-colors opacity-0 group-hover:opacity-100"
                                  title="Send email">
                                  <Mail size={12} />
                                </button>
                                <button onClick={() => { setEditingUser(user.email); setEditForm({ name: user.name || '', dob: user.dob || '', lastMood: user.lastMood || 'neutral' }); }}
                                  className="p-1.5 rounded-lg bg-[#21262D] text-[#8B949E] hover:text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/20 border border-[#30363D] transition-colors opacity-0 group-hover:opacity-100"
                                  title="Edit">
                                  <Pencil size={12} />
                                </button>
                                <button onClick={() => setDeleteConfirm(user.email)}
                                  className="p-1.5 rounded-lg bg-[#21262D] text-[#8B949E] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-[#30363D] transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete">
                                  <Trash2 size={12} />
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
            <div className="px-5 py-3 border-t border-[#30363D] flex items-center justify-between">
              <p className="text-xs text-[#484F58]">Showing {filtered.length} of {totalUsers} users</p>
              <p className="text-xs text-[#484F58]">FitMood Admin v2.0</p>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 1. Registration Growth (existing) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Registration Growth</h3>
                <p className="text-xs text-[#484F58] mb-5">New users over time</p>
                {regChartData.length === 0
                  ? <div className="h-48 flex items-center justify-center text-[#484F58] text-xs">Not enough data yet</div>
                  : <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={regChartData}>
                        <defs>
                          <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#F97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: '#484F58', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#484F58', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="count" stroke="#F97316" fill="url(#regGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                }
              </div>

              {/* 2. Mood Distribution (existing) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Mood Distribution</h3>
                <p className="text-xs text-[#484F58] mb-5">Current mood across all users</p>
                {moodChartData.length === 0
                  ? <div className="h-48 flex items-center justify-center text-[#484F58] text-xs">No mood data yet</div>
                  : <div className="flex items-center gap-6">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie data={moodChartData} dataKey="count" nameKey="mood" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                            {moodChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2">
                        {moodChartData.map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.fill }} />
                            <span className="text-xs text-[#8B949E] capitalize">{m.mood}</span>
                            <span className="text-xs text-white font-semibold ml-auto pl-4">{m.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                }
              </div>

              {/* 3. Workout Activity Over Time (NEW) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Workout Activity</h3>
                <p className="text-xs text-[#484F58] mb-5">Total workouts logged per day across all users</p>
                {workoutTrendData.length === 0
                  ? <div className="h-48 flex items-center justify-center text-[#484F58] text-xs">No workout data yet — workouts will appear here after users complete sessions</div>
                  : <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={workoutTrendData}>
                        <defs>
                          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: '#484F58', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#484F58', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                }
              </div>

              {/* 4. Age Group Distribution (NEW) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Age Distribution</h3>
                <p className="text-xs text-[#484F58] mb-5">Users grouped by age range</p>
                {ageGroupData.every(g => g.count === 0)
                  ? <div className="h-48 flex items-center justify-center text-[#484F58] text-xs">No age data yet</div>
                  : <div className="flex items-center gap-6">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie data={ageGroupData} dataKey="count" nameKey="group" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                            {ageGroupData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2">
                        {ageGroupData.map((g, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.fill }} />
                            <span className="text-xs text-[#8B949E]">{g.group}</span>
                            <span className="text-xs text-white font-semibold ml-auto pl-4">{g.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                }
              </div>

              {/* 5. Workouts per User (existing) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Workouts per User</h3>
                <p className="text-xs text-[#484F58] mb-5">Individual workout counts</p>
                {users.length === 0
                  ? <div className="h-48 flex items-center justify-center text-[#484F58] text-xs">No data yet</div>
                  : <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={users.map(u => ({ name: u.name || u.email.split('@')[0], workouts: u.workouts || 0 }))}>
                        <XAxis dataKey="name" tick={{ fill: '#484F58', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#484F58', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="workouts" fill="#F97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                }
              </div>

              {/* 6. Streak Leaderboard (NEW) */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Streak Leaderboard 🔥</h3>
                <p className="text-xs text-[#484F58] mb-5">Top 10 users by current streak</p>
                {streakLeaderData.length === 0 || streakLeaderData.every(u => u.streak === 0)
                  ? <div className="h-48 flex items-center justify-center text-[#484F58] text-xs">No streaks yet — users need to complete workouts on consecutive days</div>
                  : <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={streakLeaderData} layout="vertical">
                        <XAxis type="number" tick={{ fill: '#484F58', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} days`, 'Streak']} />
                        <Bar dataKey="streak" fill="#F97316" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                }
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ── Activity Log Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {activityModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Activity Log</h3>
                  <p className="text-xs text-[#484F58]">{activityModal.name || activityModal.email}</p>
                </div>
                <button onClick={() => setActivityModal(null)} className="p-1.5 rounded-lg hover:bg-[#21262D] text-[#484F58] hover:text-white transition-colors"><X size={15} /></button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(activityModal.activity_log || []).length === 0
                  ? <p className="text-xs text-[#484F58] text-center py-8">No activity recorded yet.</p>
                  : [...(activityModal.activity_log || [])].reverse().map((log, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs text-white">{log.action}</p>
                          <p className="text-[10px] text-[#484F58] mt-0.5">{new Date(log.time).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Email Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {emailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Send Email</h3>
                  <p className="text-xs text-[#484F58]">To: {emailModal.email}</p>
                </div>
                <button onClick={() => setEmailModal(null)} className="p-1.5 rounded-lg hover:bg-[#21262D] text-[#484F58] hover:text-white transition-colors"><X size={15} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#8B949E] mb-1">Subject</label>
                  <input className={INP} value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8B949E] mb-1">Message</label>
                  <textarea rows={5} className={INP + ' resize-none'} placeholder="Write your message..."
                    value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setEmailModal(null)} className="flex-1 py-2.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-sm font-medium border border-[#30363D] transition-colors">Cancel</button>
                <button onClick={handleSendEmail} className="flex-1 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-medium transition-all shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2">
                  <Mail size={13} /> Send Email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={16} className="text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white text-center mb-1">Delete User</h3>
              <p className="text-xs text-[#8B949E] text-center mb-5">Are you sure you want to delete <span className="text-white font-medium">{deleteConfirm}</span>? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-sm font-medium border border-[#30363D] transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create User Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Add New User</h3>
                  <p className="text-xs text-[#484F58] mt-0.5">Create a new user account</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[#21262D] text-[#484F58] hover:text-white transition-colors"><X size={15} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Full Name',      key: 'name',     type: 'text',     placeholder: 'John Doe' },
                  { label: 'Date of Birth',  key: 'dob',      type: 'date',     placeholder: '' },
                  { label: 'Email Address',  key: 'email',    type: 'email',    placeholder: 'john@example.com' },
                  { label: 'Password',       key: 'password', type: 'password', placeholder: '••••••••' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder} className={INP}
                      value={createForm[field.key]} onChange={e => setCreateForm(f => ({ ...f, [field.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-sm font-medium border border-[#30363D] transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-medium transition-all shadow-lg shadow-[#F97316]/20">Create User</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}