'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import MealPlanCard from '@/components/MealPlanCard';
import { nutritionAPI, authAPI } from '@/lib/api';

export default function NutritionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'recipes';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [goal, setGoal] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [craving, setCraving] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [healthySwaps, setHealthySwaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    }
  }, [router]);

  const goals = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '📉', color: 'from-red-400 to-pink-500' },
    { value: 'weight_gain', label: 'Weight Gain', icon: '📈', color: 'from-green-400 to-emerald-500' },
    { value: 'maintenance', label: 'Maintenance', icon: '⚖️', color: 'from-blue-400 to-cyan-500' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪', color: 'from-purple-400 to-indigo-500' },
  ];

  const restrictions = [
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { value: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
    { value: 'dairy_free', label: 'Dairy-Free', icon: '🥛' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'paleo', label: 'Paleo', icon: '🥩' },
  ];

  const cravingOptions = [
    { value: 'sweet', label: 'Sweet', icon: '🍰' },
    { value: 'salty', label: 'Salty', icon: '🧂' },
    { value: 'crunchy', label: 'Crunchy', icon: '🥨' },
    { value: 'creamy', label: 'Creamy', icon: '🍦' },
    { value: 'chocolate', label: 'Chocolate', icon: '🍫' },
    { value: 'fried', label: 'Fried', icon: '🍟' },
  ];

  const toggleRestriction = (value) => {
    setDietaryRestrictions(prev =>
      prev.includes(value)
        ? prev.filter(r => r !== value)
        : [...prev, value]
    );
  };

  const handleGetRecipes = async () => {
    if (!goal) {
      alert('Please select a goal');
      return;
    }
    setLoading(true);
    try {
      const data = await nutritionAPI.getRecipes(goal, dietaryRestrictions);
      setRecipes(data.recipes);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Error fetching recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMealPlan = async () => {
    if (!goal) {
      alert('Please select a goal');
      return;
    }
    setLoading(true);
    try {
      const data = await nutritionAPI.getMealPlan(goal, dietaryRestrictions, 7);
      setMealPlan(data.meal_plan);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      alert('Error fetching meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetHealthySwaps = async () => {
    if (!craving) {
      alert('Please select a craving');
      return;
    }
    setLoading(true);
    try {
      const data = await nutritionAPI.getHealthySwaps(craving);
      setHealthySwaps(data.swaps);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching healthy swaps:', error);
      alert('Error fetching healthy swaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGoal('');
    setDietaryRestrictions([]);
    setCraving('');
    setShowResults(false);
    setRecipes([]);
    setMealPlan([]);
    setHealthySwaps([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-purple-50/30">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            <span className="gradient-text">Smart</span> Nutrition
          </h1>
          <p className="text-lg text-gray-600 font-body">
            Personalized meal plans and recipes for your goals
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="glass-effect rounded-2xl p-2 inline-flex gap-2">
            {[
              { value: 'recipes', label: 'Recipes', icon: '🍳' },
              { value: 'meal-plan', label: 'Meal Plans', icon: '📅' },
              { value: 'swaps', label: 'Healthy Swaps', icon: '🔄' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  handleReset();
                }}
                className={`px-6 py-3 rounded-xl font-body font-semibold transition-all ${
                  activeTab === tab.value
                    ? 'bg-gradient-energy text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <motion.div
              key="recipes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!showResults ? (
                <div className="max-w-4xl mx-auto">
                  {/* Select Goal */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-4">
                      What's your goal?
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {goals.map((g) => (
                        <motion.button
                          key={g.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setGoal(g.value)}
                          className={`glass-effect rounded-2xl p-6 text-center transition-all ${
                            goal === g.value ? 'ring-4 ring-orange-500' : ''
                          }`}
                        >
                          <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${g.color} rounded-full flex items-center justify-center text-3xl`}>
                            {g.icon}
                          </div>
                          <div className="text-sm font-display font-bold">{g.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-4">
                      Any dietary restrictions? (Optional)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {restrictions.map((r) => (
                        <motion.button
                          key={r.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleRestriction(r.value)}
                          className={`glass-effect rounded-xl p-4 text-center transition-all ${
                            dietaryRestrictions.includes(r.value) ? 'ring-4 ring-orange-500 bg-orange-50' : ''
                          }`}
                        >
                          <div className="text-3xl mb-2">{r.icon}</div>
                          <div className="text-sm font-body font-semibold">{r.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleGetRecipes}
                      disabled={loading || !goal}
                      className="btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Get Recipes →'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-display font-bold">
                      Recommended Recipes
                    </h2>
                    <button onClick={handleReset} className="btn-secondary">
                      Try Again
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe, index) => (
                      <RecipeCard key={index} recipe={recipe} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Meal Plan Tab */}
          {activeTab === 'meal-plan' && (
            <motion.div
              key="meal-plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!showResults ? (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-4">
                      What's your goal?
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {goals.map((g) => (
                        <motion.button
                          key={g.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setGoal(g.value)}
                          className={`glass-effect rounded-2xl p-6 text-center transition-all ${
                            goal === g.value ? 'ring-4 ring-orange-500' : ''
                          }`}
                        >
                          <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${g.color} rounded-full flex items-center justify-center text-3xl`}>
                            {g.icon}
                          </div>
                          <div className="text-sm font-display font-bold">{g.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-4">
                      Any dietary restrictions? (Optional)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {restrictions.map((r) => (
                        <motion.button
                          key={r.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleRestriction(r.value)}
                          className={`glass-effect rounded-xl p-4 text-center transition-all ${
                            dietaryRestrictions.includes(r.value) ? 'ring-4 ring-orange-500 bg-orange-50' : ''
                          }`}
                        >
                          <div className="text-3xl mb-2">{r.icon}</div>
                          <div className="text-sm font-body font-semibold">{r.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleGetMealPlan}
                      disabled={loading || !goal}
                      className="btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Get 7-Day Meal Plan →'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-display font-bold">
                      Your 7-Day Meal Plan
                    </h2>
                    <button onClick={handleReset} className="btn-secondary">
                      Try Again
                    </button>
                  </div>
                  <div className="space-y-6">
                    {mealPlan.map((day, index) => (
                      <MealPlanCard key={index} day={day} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Healthy Swaps Tab */}
          {activeTab === 'swaps' && (
            <motion.div
              key="swaps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!showResults ? (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-display font-bold mb-2">
                      What are you craving?
                    </h2>
                    <p className="text-gray-600 font-body">
                      We'll suggest healthier alternatives
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {cravingOptions.map((c) => (
                      <motion.button
                        key={c.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCraving(c.value);
                        }}
                        className={`glass-effect rounded-2xl p-8 text-center transition-all ${
                          craving === c.value ? 'ring-4 ring-orange-500' : ''
                        }`}
                      >
                        <div className="text-5xl mb-3">{c.icon}</div>
                        <div className="text-lg font-display font-bold">{c.label}</div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleGetHealthySwaps}
                      disabled={loading || !craving}
                      className="btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Get Healthy Swaps →'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-display font-bold">
                      Healthy Alternatives for {craving}
                    </h2>
                    <button onClick={handleReset} className="btn-secondary">
                      Try Again
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {healthySwaps.map((swap, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-effect rounded-2xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{swap.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-display font-bold mb-2">
                              {swap.name}
                            </h3>
                            <p className="text-gray-600 font-body mb-3">
                              {swap.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="workout-tag">{swap.calories} cal</span>
                              {swap.benefits.map((benefit, i) => (
                                <span key={i} className="workout-tag bg-green-100 text-green-700">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}