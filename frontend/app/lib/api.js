import axios from 'axios';

const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://fitmood-backend.onrender.com'
  : 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor to automatically attach JWT tokens to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- AUTHENTICATION MODULE ---
export const authAPI = {
  register: async (name, dob, email, password) => {
    const response = await api.post('/api/auth/register', { name, dob, email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// --- WORKOUTS MODULE ---
export const workoutAPI = {
  getWorkoutsByMood: async (moodData) => {
    const response = await api.post('/api/workouts/mood-based', moodData);
    return response.data;
  },
  getAllWorkouts: async () => {
    const response = await api.get('/api/workouts/');
    return response.data;
  },
};

// --- NUTRITION MODULE ---
export const nutritionAPI = {
  getRecipes: async ({ goal, restrictions = '' }) => {
    const response = await api.get('/api/nutrition/recipes', {
      params: {
        goal,
        restrictions: Array.isArray(restrictions)
          ? restrictions.join(',')
          : restrictions,
      },
    });
    return response.data;
  },

  getMealPlan: async ({ goal, restrictions = '', days = 7 }) => {
    const response = await api.get('/api/nutrition/meal-plan', {
      params: {
        goal,
        restrictions: Array.isArray(restrictions)
          ? restrictions.join(',')
          : restrictions,
        days,
      },
    });
    return response.data;
  },

  getHealthySwaps: async ({ craving }) => {
    const response = await api.get('/api/nutrition/healthy-swaps', {
      params: { craving },
    });
    return response.data;
  },
};

export default api;