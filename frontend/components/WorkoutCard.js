'use client';

import { motion } from 'framer-motion';

export default function WorkoutCard({ workout, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-effect rounded-2xl overflow-hidden card-hover group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-energy">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {workout.icon || '🏋️'}
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-display font-bold flex-1">
            {workout.name}
          </h3>
          <div className="text-2xl ml-2">{workout.difficulty_icon || '⭐'}</div>
        </div>

        <p className="text-gray-600 font-body mb-4">
          {workout.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="workout-tag">
            ⏱️ {workout.duration} min
          </span>
          <span className="workout-tag">
            🔥 {workout.calories} cal
          </span>
          <span className="workout-tag">
            {workout.difficulty}
          </span>
        </div>

        {/* Exercises */}
        {workout.exercises && (
          <div className="mb-4">
            <h4 className="font-body font-semibold mb-2 text-sm text-gray-700">
              Exercises:
            </h4>
            <ul className="space-y-1">
              {workout.exercises.slice(0, 3).map((exercise, i) => (
                <li key={i} className="text-sm text-gray-600 font-body flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  {exercise}
                </li>
              ))}
              {workout.exercises.length > 3 && (
                <li className="text-sm text-gray-500 font-body italic">
                  +{workout.exercises.length - 3} more exercises
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Video Link */}
        {workout.video_url && (
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={workout.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-energy text-white text-center py-3 rounded-xl font-body font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            🎥 Watch Video Tutorial
          </motion.a>
        )}

        {workout.image_url && !workout.video_url && (
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={workout.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-cosmic text-white text-center py-3 rounded-xl font-body font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            🖼️ View Exercise Images
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}