'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      icon: '🧠',
      title: 'Mood-Based Workouts',
      description: 'Get personalized exercise plans that match your current energy and time',
    },
    {
      icon: '🍎',
      title: 'Smart Nutrition',
      description: 'Customized meal plans for your goals and dietary needs',
    },
    {
      icon: '📅',
      title: '7-Day Meal Plans',
      description: 'Complete weekly nutrition guidance at your fingertips',
    },
    {
      icon: '🔄',
      title: 'Healthy Swaps',
      description: 'Better alternatives for your cravings without sacrifice',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Floating Shapes */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>
      <div className="floating-shape shape-3"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-energy flex items-center justify-center text-white text-2xl font-bold">
            F
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text">
            FitMood
          </h1>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => router.push('/login')}
          className="btn-secondary text-sm md:text-base px-6 py-3"
        >
          Sign In
        </motion.button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-12 md:py-20 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold mb-6 leading-tight">
            Fitness That
            <br />
            <span className="gradient-text">Fits Your Mood</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-body">
            Get personalized workouts and nutrition plans designed around how you feel,
            what you need, and where you want to go.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="btn-primary text-lg"
            >
              Get Started Free
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary text-lg"
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Hero Image/Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="glass-effect rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-energy opacity-5"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {['🏃', '🧘', '🏋️', '🥗'].map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="text-5xl md:text-6xl">{emoji}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Everything You Need,
            <br />
            <span className="gradient-text-cosmic">All in One Place</span>
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="glass-effect rounded-3xl p-8 card-hover"
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h4 className="text-2xl font-display font-bold mb-3">{feature.title}</h4>
              <p className="text-gray-600 font-body">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text-cool">Simple Steps</span> to Success
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Tell Us How You Feel', desc: 'Share your mood, energy level, and available time' },
            { step: '02', title: 'Get Your Plan', desc: 'Receive personalized workouts and nutrition guidance' },
            { step: '03', title: 'Achieve Your Goals', desc: 'Follow along with videos, recipes, and support' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl font-display font-black gradient-text mb-4">
                {item.step}
              </div>
              <h4 className="text-xl font-display font-bold mb-2">{item.title}</h4>
              <p className="text-gray-600 font-body">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-effect rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-energy opacity-10"></div>
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Transform
              <br />
              <span className="gradient-text">Your Fitness Journey?</span>
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands who are already achieving their goals with FitMood
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="btn-primary text-xl px-12 py-5"
            >
              Start Your Journey
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 text-center text-gray-600 border-t border-gray-200">
        <p className="font-body">© 2024 FitMood. Built with passion for your wellness.</p>
      </footer>
    </main>
  );
}