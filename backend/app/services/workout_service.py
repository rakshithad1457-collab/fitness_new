from typing import List, Dict

class WorkoutService:
    def __init__(self):
        self.workouts_database = self._initialize_workouts()
    
    def _initialize_workouts(self) -> Dict:
        """Initialize workout database with mood-based workouts"""
        return {
            "energetic": [
                {
                    "name": "High-Intensity Interval Training",
                    "description": "Explosive HIIT workout to channel your energy into maximum calorie burn",
                    "duration": 20,
                    "calories": 300,
                    "difficulty": "Advanced",
                    "difficulty_icon": "🔥",
                    "icon": "⚡",
                    "exercises": [
                        "Burpees - 30 seconds",
                        "Mountain Climbers - 30 seconds",
                        "Jump Squats - 30 seconds",
                        "High Knees - 30 seconds",
                        "Rest - 30 seconds",
                        "Repeat 4 rounds"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=ml6cT4AZdqI",
                    "fitness_level": ["intermediate", "advanced"]
                },
                {
                    "name": "Power Cardio Blast",
                    "description": "High-energy cardio session perfect for when you're feeling pumped",
                    "duration": 30,
                    "calories": 400,
                    "difficulty": "Intermediate",
                    "difficulty_icon": "💪",
                    "icon": "🏃",
                    "exercises": [
                        "Jumping Jacks - 1 minute",
                        "Sprint in Place - 1 minute",
                        "Box Jumps - 45 seconds",
                        "Speed Skaters - 1 minute",
                        "Plank Jacks - 45 seconds",
                        "Repeat 3 rounds"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=gC_L9qAHVJ8",
                    "fitness_level": ["intermediate", "advanced"]
                },
                {
                    "name": "Dynamic Strength Circuit",
                    "description": "Full-body strength workout with dynamic movements",
                    "duration": 45,
                    "calories": 500,
                    "difficulty": "Advanced",
                    "difficulty_icon": "🏆",
                    "icon": "💥",
                    "exercises": [
                        "Push-ups - 15 reps",
                        "Squat Jumps - 20 reps",
                        "Dumbbell Thrusters - 12 reps",
                        "Plank to Pike - 15 reps",
                        "Lunges - 20 reps each leg",
                        "Dumbbell Rows - 15 reps",
                        "Repeat 4 rounds"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=R2bKILDvlxc",
                    "fitness_level": ["advanced"]
                }
            ],
            "tired": [
                {
                    "name": "Gentle Yoga Flow",
                    "description": "Restorative yoga sequence to energize without exhausting",
                    "duration": 20,
                    "calories": 80,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🧘",
                    "exercises": [
                        "Child's Pose - 2 minutes",
                        "Cat-Cow Stretch - 1 minute",
                        "Downward Dog - 1 minute",
                        "Gentle Forward Fold - 2 minutes",
                        "Supine Twist - 2 minutes each side",
                        "Savasana - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=v7AYKMP6rOE",
                    "fitness_level": ["beginner", "intermediate"]
                },
                {
                    "name": "Low-Impact Walking Workout",
                    "description": "Easy-paced walking routine to boost energy gently",
                    "duration": 30,
                    "calories": 120,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🚶",
                    "exercises": [
                        "Warm-up Walk - 5 minutes",
                        "Moderate Pace - 15 minutes",
                        "Arm Circles while walking - 5 minutes",
                        "Cool-down Walk - 5 minutes",
                        "Gentle Stretching - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=Zn36Ql7FJTg",
                    "fitness_level": ["beginner"]
                },
                {
                    "name": "Restorative Stretching",
                    "description": "Full-body stretching session to wake up muscles without strain",
                    "duration": 15,
                    "calories": 50,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🌿",
                    "exercises": [
                        "Neck Rolls - 1 minute",
                        "Shoulder Stretches - 2 minutes",
                        "Hamstring Stretch - 2 minutes",
                        "Hip Openers - 3 minutes",
                        "Spinal Twists - 2 minutes",
                        "Deep Breathing - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=g_tea8ZNk5A",
                    "fitness_level": ["beginner", "intermediate"]
                }
            ],
            "stressed": [
                {
                    "name": "Stress-Relief Yoga",
                    "description": "Calming yoga practice to release tension and find peace",
                    "duration": 30,
                    "calories": 100,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🧘",
                    "exercises": [
                        "Deep Breathing - 3 minutes",
                        "Easy Seated Pose - 2 minutes",
                        "Cat-Cow Stretch - 3 minutes",
                        "Child's Pose - 3 minutes",
                        "Legs-Up-The-Wall - 5 minutes",
                        "Corpse Pose - 10 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=LPyPQ-P-y9s",
                    "fitness_level": ["beginner", "intermediate"]
                },
                {
                    "name": "Mindful Walking Meditation",
                    "description": "Meditative walking to clear your mind and reduce anxiety",
                    "duration": 20,
                    "calories": 90,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🚶‍♀️",
                    "exercises": [
                        "Conscious Breathing - 3 minutes",
                        "Slow Mindful Steps - 12 minutes",
                        "Body Scan while walking - 3 minutes",
                        "Gratitude Practice - 2 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=cEqZthCaMpo",
                    "fitness_level": ["beginner"]
                },
                {
                    "name": "Tension Release Pilates",
                    "description": "Gentle Pilates movements to release stress from your body",
                    "duration": 25,
                    "calories": 110,
                    "difficulty": "Intermediate",
                    "difficulty_icon": "💪",
                    "icon": "🌸",
                    "exercises": [
                        "Pelvic Tilts - 2 minutes",
                        "Spine Stretch - 3 minutes",
                        "Rolling Like a Ball - 2 minutes",
                        "Single Leg Circles - 3 minutes",
                        "Mermaid Stretch - 3 minutes",
                        "Relaxation - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=fVIXRPP-J_U",
                    "fitness_level": ["intermediate"]
                }
            ],
            "motivated": [
                {
                    "name": "Full-Body Strength Builder",
                    "description": "Comprehensive strength training to maximize your motivation",
                    "duration": 45,
                    "calories": 450,
                    "difficulty": "Intermediate",
                    "difficulty_icon": "💪",
                    "icon": "🏋️",
                    "exercises": [
                        "Warm-up - 5 minutes",
                        "Squats - 4 sets of 12",
                        "Push-ups - 4 sets of 15",
                        "Deadlifts - 4 sets of 10",
                        "Rows - 4 sets of 12",
                        "Planks - 4 sets of 60 seconds",
                        "Cool-down - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=UBMk30rjy0o",
                    "fitness_level": ["intermediate", "advanced"]
                },
                {
                    "name": "Athletic Performance Training",
                    "description": "Sport-specific exercises to enhance overall athleticism",
                    "duration": 60,
                    "calories": 600,
                    "difficulty": "Advanced",
                    "difficulty_icon": "🔥",
                    "icon": "⚡",
                    "exercises": [
                        "Dynamic Warm-up - 10 minutes",
                        "Plyometric Drills - 15 minutes",
                        "Agility Ladder - 10 minutes",
                        "Medicine Ball Throws - 10 minutes",
                        "Sprint Intervals - 10 minutes",
                        "Cool-down and Stretch - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=MWrTxNMKJbE",
                    "fitness_level": ["advanced"]
                },
                {
                    "name": "Challenge Yourself Circuit",
                    "description": "Intense circuit training to push your limits",
                    "duration": 30,
                    "calories": 380,
                    "difficulty": "Advanced",
                    "difficulty_icon": "🏆",
                    "icon": "💥",
                    "exercises": [
                        "Burpee Pull-ups - 10 reps",
                        "Pistol Squats - 8 each leg",
                        "Handstand Push-ups - 8 reps",
                        "Hanging Leg Raises - 15 reps",
                        "Box Jump Overs - 15 reps",
                        "Repeat 4 rounds"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=3sEMj31D54M",
                    "fitness_level": ["advanced"]
                }
            ],
            "calm": [
                {
                    "name": "Peaceful Tai Chi",
                    "description": "Flowing Tai Chi movements for mind-body harmony",
                    "duration": 20,
                    "calories": 70,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "☯️",
                    "exercises": [
                        "Beginning Posture - 2 minutes",
                        "Grasp Bird's Tail - 4 minutes",
                        "Single Whip - 3 minutes",
                        "White Crane Spreads Wings - 3 minutes",
                        "Cloud Hands - 4 minutes",
                        "Closing Form - 4 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=6w7IS8_UzHM",
                    "fitness_level": ["beginner", "intermediate"]
                },
                {
                    "name": "Sunset Yoga Flow",
                    "description": "Gentle yoga sequence perfect for evening relaxation",
                    "duration": 30,
                    "calories": 95,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🌅",
                    "exercises": [
                        "Mountain Pose - 2 minutes",
                        "Sun Salutations - 10 minutes",
                        "Warrior Poses - 5 minutes",
                        "Pigeon Pose - 4 minutes each side",
                        "Reclined Butterfly - 3 minutes",
                        "Final Relaxation - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=oBu-pQG6sTY",
                    "fitness_level": ["beginner", "intermediate"]
                },
                {
                    "name": "Mindful Movement",
                    "description": "Slow, intentional exercises for present-moment awareness",
                    "duration": 25,
                    "calories": 85,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🕉️",
                    "exercises": [
                        "Centering Breath - 3 minutes",
                        "Gentle Neck Movements - 2 minutes",
                        "Mindful Arm Raises - 5 minutes",
                        "Hip Circles - 3 minutes",
                        "Flowing Spinal Waves - 5 minutes",
                        "Seated Meditation - 7 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=O7rTsJ-c2Q4",
                    "fitness_level": ["beginner"]
                }
            ],
            "neutral": [
                {
                    "name": "Balanced Full-Body Workout",
                    "description": "Well-rounded exercise routine for overall fitness",
                    "duration": 30,
                    "calories": 250,
                    "difficulty": "Intermediate",
                    "difficulty_icon": "💪",
                    "icon": "⚖️",
                    "exercises": [
                        "Warm-up Jog - 5 minutes",
                        "Bodyweight Squats - 3 sets of 15",
                        "Push-ups - 3 sets of 12",
                        "Lunges - 3 sets of 10 each",
                        "Plank - 3 sets of 45 seconds",
                        "Cool-down Stretch - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=ml6cT4AZdqI",
                    "fitness_level": ["intermediate"]
                },
                {
                    "name": "Moderate Cardio Mix",
                    "description": "Balanced cardio workout at a comfortable pace",
                    "duration": 25,
                    "calories": 220,
                    "difficulty": "Intermediate",
                    "difficulty_icon": "💪",
                    "icon": "🏃",
                    "exercises": [
                        "Light Jogging - 8 minutes",
                        "Jumping Rope - 3 minutes",
                        "Step-ups - 5 minutes",
                        "Shadowboxing - 5 minutes",
                        "Cool-down Walk - 4 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=gC_L9qAHVJ8",
                    "fitness_level": ["beginner", "intermediate"]
                },
                {
                    "name": "Core & Flexibility",
                    "description": "Focus on core strength and overall flexibility",
                    "duration": 20,
                    "calories": 130,
                    "difficulty": "Beginner",
                    "difficulty_icon": "🌱",
                    "icon": "🎯",
                    "exercises": [
                        "Bicycle Crunches - 3 sets of 20",
                        "Russian Twists - 3 sets of 30",
                        "Leg Raises - 3 sets of 15",
                        "Side Planks - 2 sets of 30s each",
                        "Full-body Stretch - 5 minutes"
                    ],
                    "video_url": "https://www.youtube.com/watch?v=fVIXRPP-J_U",
                    "fitness_level": ["beginner", "intermediate"]
                }
            ]
        }
    
    def get_workouts_by_mood(self, mood: str, duration: int, fitness_level: str) -> List[Dict]:
        """Get workouts filtered by mood, duration, and fitness level"""
        mood = mood.lower()
        fitness_level = fitness_level.lower()
        
        if mood not in self.workouts_database:
            mood = "neutral"
        
        all_workouts = self.workouts_database[mood]
        
        # Filter by fitness level and duration
        filtered_workouts = []
        for workout in all_workouts:
            # Check if workout matches fitness level
            if fitness_level in workout.get("fitness_level", ["intermediate"]):
                # Check if workout duration is appropriate (within ±10 minutes)
                if abs(workout["duration"] - duration) <= 15:
                    # Remove fitness_level from response
                    workout_copy = workout.copy()
                    workout_copy.pop("fitness_level", None)
                    filtered_workouts.append(workout_copy)
        
        # If no exact matches, return workouts close to duration
        if not filtered_workouts:
            for workout in all_workouts:
                workout_copy = workout.copy()
                workout_copy.pop("fitness_level", None)
                filtered_workouts.append(workout_copy)
        
        return filtered_workouts[:3]  # Return max 3 workouts
    
    def get_all_workouts(self) -> List[Dict]:
        """Get all available workouts"""
        all_workouts = []
        for mood_workouts in self.workouts_database.values():
            for workout in mood_workouts:
                workout_copy = workout.copy()
                workout_copy.pop("fitness_level", None)
                all_workouts.append(workout_copy)
        return all_workouts