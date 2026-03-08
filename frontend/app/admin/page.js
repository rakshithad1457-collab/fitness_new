'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Dumbbell, TrendingUp, LogOut, ShieldCheck,
  RefreshCw, Activity, Trash2, Pencil, Plus, X, Check,
  Search, ChevronUp, ChevronDown, Download,
} from 'lucide-react';

const MOOD_COLORS = {
  energetic: '#F97316', stressed: '#3B82F6', happy: '#22C55E',
  tired: '#8B5CF6', motivated: '#EAB308', sad: '#EF4444',
  anxious: '#EC4899', neutral: '#6B7280',
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const INP = "w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-white placeholder-[#484F58] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', dob: '', email: '', password: '' });
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/admin/users`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setError('Unable to reach backend. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

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
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
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
    } catch {
      showToast('Failed to delete user', 'error');
    }
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
      showToast('User updated successfully');
    } catch {
      showToast('Failed to update user', 'error');
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
      showToast('User created successfully');
      fetchUsers();
    } catch (e) {
      showToast(e.message || 'Failed to create user', 'error');
    }
  };

  const exportCSV = () => {
    const rows = [['ID', 'Name', 'Email', 'DOB', 'Joined', 'Workouts', 'Mood']];
    users.forEach(u => rows.push([u.id, u.name, u.email, u.dob, u.joined, u.workouts, u.lastMood]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'fitmood_users.csv'; a.click();
  };

  const totalUsers = users.length;
  const totalWorkouts = users.reduce((s, u) => s + (u.workouts || 0), 0);
  const avgWorkouts = totalUsers ? (totalWorkouts / totalUsers).toFixed(1) : 0;
  const moodCounts = users.reduce((acc, u) => { if (u.lastMood) acc[u.lastMood] = (acc[u.lastMood] || 0) + 1; return acc; }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const STATS = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: '#F97316', bg: '#F9731610' },
    { label: 'Total Workouts', value: totalWorkouts, icon: Dumbbell, color: '#22C55E', bg: '#22C55E10' },
    { label: 'Avg per User', value: avgWorkouts, icon: TrendingUp, color: '#3B82F6', bg: '#3B82F610' },
    { label: 'Top Mood', value: topMood, icon: Activity, color: '#8B5CF6', bg: '#8B5CF610' },
  ];

  const SortIcon = ({ col }) => sortKey === col
    ? (sortDir === 'asc' ? <ChevronUp size={12} className="text-[#F97316]" /> : <ChevronDown size={12} className="text-[#F97316]" />)
    : <ChevronUp size={12} className="text-[#484F58]" />;

  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${
              toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
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
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-xs font-medium transition-all border border-[#30363D]">
            <Download size={12} /> Export CSV
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA6C0A] text-white text-xs font-medium transition-all shadow-lg shadow-[#F97316]/20">
            <Plus size={12} /> Add User
          </button>
          <button onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-xs font-medium transition-all border border-[#30363D]">
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

        {error && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Table Card */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">

          {/* Table Header */}
          <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Users</h2>
              <p className="text-xs text-[#484F58] mt-0.5">{totalUsers} registered accounts</p>
            </div>
            <div className="relative w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484F58]" />
              <input
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-[#484F58] outline-none focus:border-[#F97316] transition-colors"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#484F58] text-sm">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#484F58] text-sm">
              {search ? 'No users match your search.' : 'No users registered yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#30363D]">
                    {[
                      { label: '#', key: 'id' },
                      { label: 'User', key: 'name' },
                      { label: 'Email', key: 'email' },
                      { label: 'DOB', key: 'dob' },
                      { label: 'Joined', key: 'joined' },
                      { label: 'Mood', key: 'lastMood' },
                      { label: 'Workouts', key: 'workouts' },
                      { label: 'Actions', key: null },
                    ].map(col => (
                      <th key={col.label}
                        onClick={() => col.key && handleSort(col.key)}
                        className={`text-left px-5 py-3 text-xs font-semibold text-[#8B949E] uppercase tracking-wider whitespace-nowrap ${col.key ? 'cursor-pointer hover:text-white select-none' : ''}`}>
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.key && <SortIcon col={col.key} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262D]">
                  {filtered.map((user, i) => (
                    <motion.tr key={user.email}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-[#1C2128] transition-colors group">

                      <td className="px-5 py-3.5 text-[#484F58] text-xs">{user.id}</td>

                      <td className="px-5 py-3.5">
                        {editingUser === user.email
                          ? <input className={INP} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          : <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center text-[#F97316] text-xs font-bold">
                                {user.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-white">{user.name || '—'}</span>
                            </div>
                        }
                      </td>

                      <td className="px-5 py-3.5 text-[#8B949E] text-xs">{user.email}</td>

                      <td className="px-5 py-3.5">
                        {editingUser === user.email
                          ? <input type="date" className={INP} value={editForm.dob} onChange={e => setEditForm(f => ({ ...f, dob: e.target.value }))} />
                          : <span className="text-[#8B949E] text-xs">{user.dob || '—'}</span>
                        }
                      </td>

                      <td className="px-5 py-3.5 text-[#8B949E] text-xs">{user.joined || '—'}</td>

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
                              <button
                                onClick={() => { setEditingUser(user.email); setEditForm({ name: user.name || '', dob: user.dob || '', lastMood: user.lastMood || 'neutral' }); }}
                                className="p-1.5 rounded-lg bg-[#21262D] text-[#8B949E] hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 border border-[#30363D] transition-colors opacity-0 group-hover:opacity-100">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => setDeleteConfirm(user.email)}
                                className="p-1.5 rounded-lg bg-[#21262D] text-[#8B949E] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-[#30363D] transition-colors opacity-0 group-hover:opacity-100">
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

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[#30363D] flex items-center justify-between">
            <p className="text-xs text-[#484F58]">
              Showing {filtered.length} of {totalUsers} users
            </p>
            <p className="text-xs text-[#484F58]">FitMood Admin v1.0</p>
          </div>
        </div>
      </main>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={16} className="text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white text-center mb-1">Delete User</h3>
              <p className="text-xs text-[#8B949E] text-center mb-5">
                Are you sure you want to delete <span className="text-white font-medium">{deleteConfirm}</span>? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-sm font-medium border border-[#30363D] transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Add New User</h3>
                  <p className="text-xs text-[#484F58] mt-0.5">Create a new user account</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[#21262D] text-[#484F58] hover:text-white transition-colors">
                  <X size={15} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                  { label: 'Date of Birth', key: 'dob', type: 'date', placeholder: '' },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@example.com' },
                  { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-[#8B949E] mb-1">{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder} className={INP}
                      value={createForm[field.key]}
                      onChange={e => setCreateForm(f => ({ ...f, [field.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white text-sm font-medium border border-[#30363D] transition-colors">
                  Cancel
                </button>
                <button onClick={handleCreate}
                  className="flex-1 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-medium transition-all shadow-lg shadow-[#F97316]/20">
                  Create User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}