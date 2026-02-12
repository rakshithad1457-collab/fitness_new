'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecipeCard({ recipe, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-effect rounded-2xl overflow-hidden card-hover"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-cosmic">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {recipe.icon || '🍽️'}
        </div>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-display font-bold mb-2">
          {recipe.name}
        </h3>

        <p className="text-gray-600 font-body text-sm mb-4">
          {recipe.description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="workout-tag">
            ⏱️ {recipe.prep_time} min
          </span>
          <span className="workout-tag">
            🔥 {recipe.calories} cal
          </span>
          <span className="workout-tag">
            🍽️ {recipe.servings} servings
          </span>
        </div>

        {/* Dietary Tags */}
        {recipe.dietary_tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.dietary_tags.map((tag, i) => (
              <span key={i} className="workout-tag bg-green-100 text-green-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded(!expanded)}
          className="w-full bg-gradient-energy text-white py-3 rounded-xl font-body font-semibold shadow-lg transition-all"
        >
          {expanded ? '↑ Hide Details' : '↓ View Recipe'}
        </motion.button>

        {/* Expandable Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* Ingredients */}
                {recipe.ingredients && (
                  <div className="mb-4">
                    <h4 className="font-body font-bold mb-2">Ingredients:</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ingredient, i) => (
                        <li key={i} className="text-sm text-gray-600 font-body flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                {recipe.instructions && (
                  <div>
                    <h4 className="font-body font-bold mb-2">Instructions:</h4>
                    <ol className="space-y-2">
                      {recipe.instructions.map((instruction, i) => (
                        <li key={i} className="text-sm text-gray-600 font-body flex gap-2">
                          <span className="font-bold text-orange-500">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}