import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Workouts API
export const workoutsAPI = {
  getByMood: async (mood, duration, fitnessLevel = 'intermediate') => {
    const response = await api.post('/workouts/mood-based', {
      mood,
      duration,
      fitness_level: fitnessLevel,
    });
    return response.data;
  },
  
  getAllWorkouts: async () => {
    const response = await api.get('/workouts');
    return response.data;
  },
};

// Nutrition API
export const nutritionAPI = {
  getRecipes: async (goal, dietaryRestrictions = []) => {
    const response = await api.get('/nutrition/recipes', {
      params: {
        goal,
        restrictions: dietaryRestrictions.join(','),
      },
    });
    return response.data;
  },
  
  getMealPlan: async (goal, dietaryRestrictions = [], days = 7) => {
    const response = await api.post('/nutrition/meal-plan', {
      goal,
      dietary_restrictions: dietaryRestrictions,
      days,
    });
    return response.data;
  },
  
  getHealthySwaps: async (craving) => {
    const response = await api.post('/nutrition/healthy-swaps', {
      craving,
    });
    return response.data;
  },
};

export default api;