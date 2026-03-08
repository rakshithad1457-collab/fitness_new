'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { authAPI, nutritionAPI } from '@/lib/api';
import { RecipeCard, MealPlanCard, SwapCard } from '../components/NutritionCard';

const GOALS = [
  { value: 'weight_loss',  label: 'Weight Loss',  emoji: '⚖️' },
  { value: 'weight_gain',  label: 'Weight Gain',  emoji: '📈' },
  { value: 'maintenance',  label: 'Maintenance',  emoji: '🎯' },
  { value: 'muscle_gain',  label: 'Muscle Gain',  emoji: '🏋️' },
];

const DIETARY_OPTIONS = ['Vegan', 'Gluten-Free', 'Dairy-Free', 'High-Protein', 'Low-Carb', 'Keto'];

const CRAVINGS = [
  { value: 'sweet',     label: 'Sweet',     emoji: '🍭' },
  { value: 'salty',     label: 'Salty',     emoji: '🧂' },
  { value: 'crunchy',   label: 'Crunchy',   emoji: '🥨' },
  { value: 'creamy',    label: 'Creamy',    emoji: '🥛' },
  { value: 'chocolate', label: 'Chocolate', emoji: '🍫' },
  { value: 'fried',     label: 'Fried',     emoji: '🍟' },
];

const TABS = ['Recipes', 'Meal Plan', 'Healthy Swaps'];

function NutritionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab]             = useState('Recipes');
  const [selectedGoal, setSelectedGoal]       = useState('weight_loss');
  const [restrictions, setRestrictions]       = useState([]);
  const [selectedCraving, setSelectedCraving] = useState('sweet');
  const [recipes, setRecipes]                 = useState([]);
  const [mealPlan, setMealPlan]               = useState([]);
  const [swaps, setSwaps]                     = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [generated, setGenerated]             = useState(false);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) router.push('/login');
  }, [router]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const matched = TABS.find((t) => t.toLowerCase().replace(' ', '-') === tabParam);
      if (matched) setActiveTab(matched);
    }
  }, [searchParams]);

  useEffect(() => {
    setGenerated(false);
    setRecipes([]);
    setMealPlan([]);
    setSwaps([]);
    setError(null);
  }, [activeTab]);

  const toggleRestriction = (item) => {
    setRestrictions((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGenerated(false);
    try {
      if (activeTab === 'Recipes') {
        const data = await nutritionAPI.getRecipes({ goal: selectedGoal, restrictions: restrictions.join(',') });
        setRecipes(data.recipes || []);
      } else if (activeTab === 'Meal Plan') {
        const data = await nutritionAPI.getMealPlan({ goal: selectedGoal, restrictions: restrictions.join(','), days: 7 });
        setMealPlan(data.meal_plan || []);
      } else if (activeTab === 'Healthy Swaps') {
        const data = await nutritionAPI.getHealthySwaps({ craving: selectedCraving });
        setSwaps(data.swaps || []);
      }
      setGenerated(true);
    } catch (err) {
      setError('AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = () => {
    if (activeTab === 'Recipes')       return 'Generate Recipes with AI';
    if (activeTab === 'Meal Plan')     return 'Generate 7-Day Meal Plan with AI';
    if (activeTab === 'Healthy Swaps') return 'Find Healthy Swaps with AI';
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-[0.05em] mb-3 text-[#1F2937]">
          FUEL YOUR <span className="text-[#FB923C]">BODY</span>
        </h1>
        <p className="text-[#6B7280] font-medium tracking-wide uppercase text-[10px]">
          AI-generated nutrition plans — unique every time you click
        </p>
      </header>

      <div className="flex bg-white rounded-2xl p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-8">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-[#1F2937] text-white shadow-md' : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Healthy Swaps' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F2937] mb-5">Your Goal</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GOALS.map((g) => (
                <motion.button key={g.value} whileHover={{ translateY: -3 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedGoal(g.value)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-200 ${
                    selectedGoal === g.value ? 'bg-[#1F2937] text-white shadow-lg' : 'bg-[#F8F9FC] text-[#6B7280] hover:bg-gray-100'
                  }`}>
                  <span className="text-2xl mb-2">{g.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{g.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F2937] mb-5">
              Dietary Restrictions <span className="text-[#9CA3AF] normal-case font-medium tracking-normal text-xs">(optional)</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {DIETARY_OPTIONS.map((item) => {
                const active = restrictions.includes(item);
                return (
                  <button key={item} onClick={() => toggleRestriction(item)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      active ? 'bg-[#FB923C] text-white shadow-md' : 'bg-[#F8F9FC] text-[#6B7280] hover:bg-gray-100'
                    }`}>
                    {active ? '✓  ' : ''}{item}
                  </button>
                );
              })}
            </div>
            {restrictions.length > 0 && (
              <button onClick={() => setRestrictions([])}
                className="mt-4 text-[11px] text-[#9CA3AF] hover:text-[#6B7280] font-medium underline">
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Healthy Swaps' && (
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F2937] mb-5">What are you craving?</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CRAVINGS.map((c) => (
              <motion.button key={c.value} whileHover={{ translateY: -3 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCraving(c.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                  selectedCraving === c.value ? 'bg-[#1F2937] text-white shadow-lg' : 'bg-[#F8F9FC] text-[#6B7280] hover:bg-gray-100'
                }`}>
                <span className="text-2xl mb-1">{c.emoji}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest">{c.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={handleGenerate} disabled={loading}
        className="w-full bg-gradient-to-r from-[#FB923C] to-[#F97316] text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(249,115,22,0.3)] disabled:opacity-60 mb-10 flex items-center justify-center gap-3">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI is generating...</>
        ) : (
          <><Sparkles size={18} />{buttonLabel()}</>
        )}
      </motion.button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">{error}</div>
      )}

      <AnimatePresence mode="wait">
        {generated && (
          <motion.div key={activeTab + selectedGoal + restrictions.join() + selectedCraving}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {activeTab === 'Recipes' && (
              recipes.length > 0 ? recipes.map((r, i) => <RecipeCard key={i} recipe={r} />) : <EmptyState message="No recipes returned. Try again." />
            )}
            {activeTab === 'Meal Plan' && (
              mealPlan.length > 0 ? mealPlan.map((day, i) => <MealPlanCard key={i} day={day} />) : <EmptyState message="No meal plan returned. Try again." />
            )}
            {activeTab === 'Healthy Swaps' && (
              swaps.length > 0 ? swaps.map((s, i) => <SwapCard key={i} swap={s} />) : <EmptyState message="No swaps returned. Try again." />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NutritionPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FC] text-[#1F2937]">
      <Navbar />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FB923C]"></div>
        </div>
      }>
        <NutritionContent />
      </Suspense>
    </main>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
      <span className="text-4xl mb-4">🍽️</span>
      <p className="font-bold uppercase tracking-widest text-xs">{message}</p>
    </div>
  );
}