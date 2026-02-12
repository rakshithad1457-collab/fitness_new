"use client";
import React, { useState } from 'react';

export default function FitnessApp() {
  const [mood, setMood] = useState('Energetic');
  const [time, setTime] = useState(20);
  const [goal, setGoal] = useState('Weight Loss');
  const [result, setResult] = useState<any>(null);
  const [foodResult, setFoodResult] = useState<any>(null);

  const getWorkout = async () => {
    const res = await fetch('http://127.0.0.1:8000/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, time_available: time }),
    });
    const data = await res.json();
    setResult(data);
  };

  const getFood = async () => {
    const res = await fetch('http://127.0.0.1:8000/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, restrictions: ["None"] }),
    });
    const data = await res.json();
    setFoodResult(data);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto py-10 text-center">
        <h1 className="text-5xl font-black text-lime-400 tracking-tighter italic uppercase">FitMood</h1>
        <p className="text-zinc-400 mt-2">Personalized fitness for your mindset.</p>
      </header>

      <main className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Workout Section */}
        <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-lime-400/50 transition">
          <h2 className="text-2xl font-bold mb-6 text-lime-400">1. How are you feeling?</h2>
          <select onChange={(e) => setMood(e.target.value)} className="w-full bg-zinc-800 p-4 rounded-xl mb-4 outline-none border border-zinc-700">
            <option>Energetic</option>
            <option>Tired</option>
            <option>Stressed</option>
          </select>
          <input type="number" placeholder="Time (mins)" onChange={(e) => setTime(Number(e.target.value))} className="w-full bg-zinc-800 p-4 rounded-xl mb-6 outline-none border border-zinc-700" />
          <button onClick={getWorkout} className="w-full bg-lime-400 text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-lime-300 transition">Get Workout</button>
          
          {result && (
            <div className="mt-6 p-4 bg-black rounded-2xl border-l-4 border-lime-400">
              <h3 className="font-bold text-xl">{result.title}</h3>
              <p className="text-zinc-400">{result.duration}</p>
              <a href={result.video_url} target="_blank" className="text-lime-400 text-sm underline mt-2 inline-block">Watch Video →</a>
            </div>
          )}
        </section>

        {/* Food Section */}
        <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-lime-400/50 transition">
          <h2 className="text-2xl font-bold mb-6 text-lime-400">2. Nutrition Goal</h2>
          <div className="flex gap-4 mb-6">
            <button onClick={() => setGoal('Weight Loss')} className={`flex-1 py-3 rounded-xl font-bold ${goal === 'Weight Loss' ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-white'}`}>Loss</button>
            <button onClick={() => setGoal('Weight Gain')} className={`flex-1 py-3 rounded-xl font-bold ${goal === 'Weight Gain' ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-white'}`}>Gain</button>
          </div>
          <button onClick={getFood} className="w-full bg-transparent border-2 border-lime-400 text-lime-400 font-black py-4 rounded-xl uppercase tracking-widest hover:bg-lime-400 hover:text-black transition">Generate Meal</button>
          
          {foodResult && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-zinc-800 rounded-2xl">
                <span className="text-xs text-lime-400 font-bold uppercase">Recipe</span>
                <p className="font-bold">{foodResult.recipe_name}</p>
              </div>
              <div className="p-4 bg-lime-400 text-black rounded-2xl">
                <span className="text-xs font-bold uppercase opacity-60">Healthy Swap</span>
                <p className="font-bold">{foodResult.swap}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}