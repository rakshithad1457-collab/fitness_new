'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { authAPI } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  const quickActions = [
    {
      title: 'Get Workout',
      description: 'Find exercises for your mood',
      icon: '💪',
      gradient: 'bg-gradient-energy',
      path: '/workouts',
    },
    {
      title: 'Meal Plans',
      description: '7-day nutrition guidance',
      icon: '🥗',
      gradient: 'bg-gradient-cool',
      path: '/nutrition?tab=meal-plan',
    },
    {
      title: 'Recipes',
      description: 'Personalized meal ideas',
      icon: '🍳',
      gradient: 'bg-gradient-cosmic',
      path: '/nutrition?tab=recipes',
    },
    {
      title: 'Healthy Swaps',
      description: 'Better food alternatives',
      icon: '🔄',
      gradient: 'bg-gradient-to-br from-green-400 to-emerald-600',
      path: '/nutrition?tab=swaps',
    },
  ];

  const stats = [
    { label: 'Workouts Completed', value: '0', icon: '🏃' },
    { label: 'Calories Burned', value: '0', icon: '🔥' },
    { label: 'Active Days', value: '0', icon: '📅' },
    { label: 'Recipes Saved', value: '0', icon: '❤️' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-purple-50/30">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Welcome back, <span className="gradient-text">{user.email.split('@')[0]}</span>! 👋
          </h1>
          <p className="text-lg text-gray-600 font-body">
            Ready to make today count? Choose your path below.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-display font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => router.push(action.path)}
                className="cursor-pointer group"
              >
                <div className="glass-effect rounded-2xl p-6 h-full relative overflow-hidden transition-all hover:shadow-2xl">
                  <div className={`absolute inset-0 ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 ${action.gradient} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                      {action.icon}
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 font-body text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-display font-bold mb-6">Your Progress</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="glass-effect rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-display font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-body">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-effect rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-energy opacity-10"></div>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Your Journey Starts Now
            </h3>
            <p className="text-gray-600 font-body mb-6">
              Every small step counts. Whether it's a quick workout or a healthy meal,
              you're making progress towards your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/workouts')}
                className="btn-primary"
              >
                Start Workout
              </button>
              <button
                onClick={() => router.push('/nutrition')}
                className="btn-secondary"
              >
                View Nutrition
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}