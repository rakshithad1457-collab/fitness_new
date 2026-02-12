'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MealPlanCard({ day, index }) {
  const [expanded, setExpanded] = useState(false);

  const getDayColor = (dayNum) => {
    const colors = [
      'from-red-400 to-orange-500',
      'from-orange-400 to-yellow-500',
      'from-yellow-400 to-green-500',
      'from-green-400 to-teal-500',
      'from-teal-400 to-blue-500',
      'from-blue-400 to-indigo-500',
      'from-indigo-400 to-purple-500',
    ];
    return colors[dayNum % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-effect rounded-2xl overflow-hidden"
    >
      <div
        className={`bg-gradient-to-r ${getDayColor(day.day)} p-4 flex items-center justify-between cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="text-white font-display font-bold text-xl">
            Day {day.day} - {day.day_name}
          </h3>
          <p className="text-white/90 text-sm font-body">
            {day.total_calories} calories • {day.meals?.length || 3} meals
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white text-2xl"
        >
          ↓
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {day.meals?.map((meal, mealIndex) => (
                <div key={mealIndex} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{meal.icon || '🍽️'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-display font-bold text-lg">
                          {meal.meal_type}
                        </h4>
                        <span className="text-sm text-gray-500">
                          ({meal.time})
                        </span>
                      </div>

                      <p className="font-body font-semibold mb-2">
                        {meal.name}
                      </p>

                      <p className="text-gray-600 font-body text-sm mb-3">
                        {meal.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="workout-tag">
                          🔥 {meal.calories} cal
                        </span>
                        <span className="workout-tag">
                          🥩 {meal.protein}g protein
                        </span>
                        <span className="workout-tag">
                          🍞 {meal.carbs}g carbs
                        </span>
                        <span className="workout-tag">
                          🥑 {meal.fats}g fats
                        </span>
                      </div>

                      {/* Quick Recipe */}
                      {meal.quick_recipe && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-sm font-body text-gray-700">
                            <span className="font-semibold">Quick Recipe: </span>
                            {meal.quick_recipe}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Daily Tips */}
              {day.tips && (
                <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4">
                  <h4 className="font-display font-bold mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Daily Tip
                  </h4>
                  <p className="text-sm font-body text-gray-700">
                    {day.tips}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}