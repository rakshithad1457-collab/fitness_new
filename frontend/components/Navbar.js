'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    authAPI.logout();
    router.push('/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/workouts', label: 'Workouts', icon: '💪' },
    { path: '/nutrition', label: 'Nutrition', icon: '🥗' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-energy flex items-center justify-center text-white text-xl font-bold shadow-lg">
              F
            </div>
            <h1 className="text-2xl font-display font-bold gradient-text hidden sm:block">
              FitMood
            </h1>
          </motion.div>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            {navLinks.map((link) => (
              <motion.button
                key={link.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(link.path)}
                className={`px-4 py-2 rounded-xl font-body font-semibold transition-all ${
                  pathname === link.path
                    ? 'bg-gradient-energy text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span className="mr-1 sm:mr-2">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </motion.button>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-xl font-body font-semibold text-red-600 hover:bg-red-50 transition-all"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚪</span>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}