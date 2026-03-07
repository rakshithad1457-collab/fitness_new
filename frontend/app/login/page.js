'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, User, Calendar } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '', dob: '', email: '', password: '', otp: '', newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  const handleLogin = async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: formData.email,
      password: formData.password
    });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    router.push('/dashboard');
  };

  const handleRegister = async () => {
    const res = await axios.post(`${API}/auth/register`, {
      name: formData.name,
      dob: formData.dob,
      email: formData.email,
      password: formData.password,
    });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    router.push('/dashboard');
  };

  const handleForgot = async () => {
    await axios.post(`${API}/auth/forgot-password`, { email: formData.email });
    setSuccess('OTP sent! Check your email or backend terminal.');
    setMode('otp');
  };

  const handleResetPassword = async () => {
    await axios.post(`${API}/auth/reset-password`, {
      email: formData.email,
      otp: formData.otp,
      new_password: formData.newPassword,
    });
    setSuccess('Password reset successfully! Please login.');
    setMode('login');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') await handleLogin();
      else if (mode === 'register') await handleRegister();
      else if (mode === 'forgot') await handleForgot();
      else if (mode === 'otp') await handleResetPassword();
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: 'Welcome Back',
    register: 'Create Account',
    forgot: 'Forgot Password',
    otp: 'Reset Password'
  };

  const subtitles = {
    login: 'Ready for your mood-based workout?',
    register: 'Initialize your fitness journey',
    forgot: 'Enter your email to receive OTP',
    otp: 'Enter OTP and set new password'
  };

  const btnLabels = {
    login: 'Sign In',
    register: 'Sign Up',
    forgot: 'Send OTP',
    otp: 'Reset Password'
  };

  return (
    <main className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-10 cursor-pointer"
        onClick={() => router.push('/')}
      >
        <div className="w-10 h-10 rounded-xl bg-[#1F2937] flex items-center justify-center text-white text-xl font-bold">F</div>
        <h1 className="text-xl font-bold tracking-tight text-[#1F2937]">FitMood</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-50"
      >
        <header className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-[#1F2937] tracking-[-0.02em] mb-2 uppercase">
            {titles[mode]}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6B7280]">
            {subtitles[mode]}
          </p>
        </header>

        <div className="space-y-5">

          {/* Full Name - register only */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  placeholder="John Doe"
                  className="w-full bg-[#F8F9FC] border-2 border-transparent focus:border-[#FB923C]/30 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-[#1F2937] outline-none transition-all"
                  onChange={e => update('name', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Date of Birth - register only */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  className="w-full bg-[#F8F9FC] border-2 border-transparent focus:border-[#FB923C]/30 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-[#1F2937] outline-none transition-all"
                  onChange={e => update('dob', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="email"
                required
                value={formData.email}
                placeholder="name@example.com"
                className="w-full bg-[#F8F9FC] border-2 border-transparent focus:border-[#FB923C]/30 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-[#1F2937] outline-none transition-all"
                onChange={e => update('email', e.target.value)}
              />
            </div>
          </div>

          {/* Password - login & register only */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  placeholder="••••••••"
                  className="w-full bg-[#F8F9FC] border-2 border-transparent focus:border-[#FB923C]/30 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-[#1F2937] outline-none transition-all"
                  onChange={e => update('password', e.target.value)}
                />
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setMode('forgot'); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#FB923C] hover:underline ml-1"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}

          {/* OTP + New Password - otp mode only */}
          {mode === 'otp' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">OTP Code</label>
                <input
                  type="text"
                  required
                  value={formData.otp}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-[#F8F9FC] border-2 border-transparent focus:border-[#FB923C]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-medium text-[#1F2937] outline-none transition-all"
                  onChange={e => update('otp', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="password"
                    required
                    value={formData.newPassword}
                    placeholder="••••••••"
                    className="w-full bg-[#F8F9FC] border-2 border-transparent focus:border-[#FB923C]/30 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-[#1F2937] outline-none transition-all"
                    onChange={e => update('newPassword', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase tracking-wider text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-[11px] font-bold uppercase tracking-wider text-center"
            >
              {success}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FB923C] to-[#F97316] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-[0_8px_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : btnLabels[mode]}
            <ArrowRight size={16} />
          </motion.button>
        </div>

        <footer className="mt-8 text-center border-t border-gray-50 pt-6">
          {mode === 'login' && (
            <button
              onClick={() => { setError(''); setSuccess(''); setMode('register'); }}
              className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#FB923C] transition-colors"
            >
              Don't have an account? Sign Up
            </button>
          )}
          {(mode === 'register' || mode === 'forgot' || mode === 'otp') && (
            <button
              onClick={() => { setError(''); setSuccess(''); setMode('login'); }}
              className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#FB923C] transition-colors"
            >
              Back to Sign In
            </button>
          )}
        </footer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex gap-8"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Secure Access</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Instant Sync</span>
        </div>
      </motion.div>
    </main>
  );
}