from typing import List, Dict

class NutritionService:
    def __init__(self):
        self.recipes_database = self._initialize_recipes()
        self.healthy_swaps_database = self._initialize_healthy_swaps()
    
    def _initialize_recipes(self) -> Dict:
        """Initialize recipe database"""
        return {
            "weight_loss": [
                {
                    "name": "Grilled Chicken & Veggie Bowl",
                    "description": "Protein-packed bowl with colorful vegetables and quinoa",
                    "prep_time": 25,
                    "calories": 380,
                    "servings": 2,
                    "icon": "🥗",
                    "dietary_tags": ["High-Protein", "Gluten-Free"],
                    "ingredients": [
                        "200g chicken breast",
                        "1 cup quinoa",
                        "2 cups mixed vegetables (broccoli, bell peppers, carrots)",
                        "2 tbsp olive oil",
                        "Lemon juice",
                        "Herbs and spices"
                    ],
                    "instructions": [
                        "Cook quinoa according to package directions",
                        "Season chicken with herbs and grill until cooked through",
                        "Steam or roast vegetables",
                        "Assemble bowl with quinoa base, vegetables, and sliced chicken",
                        "Drizzle with olive oil and lemon juice"
                    ]
                },
                {
                    "name": "Mediterranean Tuna Salad",
                    "description": "Fresh and filling salad loaded with omega-3s",
                    "prep_time": 15,
                    "calories": 320,
                    "servings": 2,
                    "icon": "🥙",
                    "dietary_tags": ["High-Protein", "Dairy-Free"],
                    "ingredients": [
                        "2 cans tuna in water",
                        "4 cups mixed greens",
                        "1 cup cherry tomatoes",
                        "1/2 cucumber, diced",
                        "1/4 red onion, sliced",
                        "2 tbsp olive oil",
                        "Balsamic vinegar",
                        "Fresh basil"
                    ],
                    "instructions": [
                        "Drain tuna and flake with a fork",
                        "Chop all vegetables",
                        "Combine greens, tomatoes, cucumber, and onion in a large bowl",
                        "Add tuna on top",
                        "Dress with olive oil and balsamic vinegar",
                        "Garnish with fresh basil"
                    ]
                },
                {
                    "name": "Zucchini Noodle Stir-Fry",
                    "description": "Low-carb veggie noodles with lean protein",
                    "prep_time": 20,
                    "calories": 280,
                    "servings": 2,
                    "icon": "🍜",
                    "dietary_tags": ["Low-Carb", "Gluten-Free", "Dairy-Free"],
                    "ingredients": [
                        "3 medium zucchinis, spiralized",
                        "150g shrimp or tofu",
                        "1 bell pepper, sliced",
                        "1 cup snap peas",
                        "2 cloves garlic, minced",
                        "1 tbsp coconut oil",
                        "2 tbsp low-sodium soy sauce",
                        "Sesame seeds"
                    ],
                    "instructions": [
                        "Spiralize zucchini into noodles",
                        "Heat coconut oil in a large pan",
                        "Sauté garlic, then add shrimp/tofu",
                        "Add bell pepper and snap peas, cook until tender-crisp",
                        "Add zucchini noodles and soy sauce, toss for 2-3 minutes",
                        "Top with sesame seeds"
                    ]
                }
            ],
            "weight_gain": [
                {
                    "name": "Power-Packed Protein Bowl",
                    "description": "Calorie-dense meal with quality proteins and healthy fats",
                    "prep_time": 30,
                    "calories": 680,
                    "servings": 2,
                    "icon": "🍖",
                    "dietary_tags": ["High-Protein", "High-Calorie"],
                    "ingredients": [
                        "250g beef or chicken",
                        "2 cups brown rice",
                        "1 avocado, sliced",
                        "2 eggs",
                        "1 cup black beans",
                        "1/4 cup cheese",
                        "Olive oil",
                        "Seasonings"
                    ],
                    "instructions": [
                        "Cook brown rice",
                        "Season and cook meat of choice",
                        "Fry eggs sunny-side up",
                        "Warm black beans",
                        "Assemble bowl with rice, beans, meat, egg, and avocado",
                        "Top with cheese and drizzle with olive oil"
                    ]
                },
                {
                    "name": "Peanut Butter Banana Smoothie",
                    "description": "Nutrient-dense smoothie perfect for gaining healthy weight",
                    "prep_time": 5,
                    "calories": 520,
                    "servings": 1,
                    "icon": "🥤",
                    "dietary_tags": ["High-Calorie", "High-Protein"],
                    "ingredients": [
                        "2 bananas",
                        "3 tbsp peanut butter",
                        "2 cups whole milk or oat milk",
                        "2 scoops protein powder",
                        "2 tbsp honey",
                        "1/4 cup oats",
                        "Ice cubes"
                    ],
                    "instructions": [
                        "Add all ingredients to blender",
                        "Blend until smooth and creamy",
                        "Pour into glass",
                        "Optionally top with granola or nuts"
                    ]
                },
                {
                    "name": "Loaded Sweet Potato",
                    "description": "Nutrient-rich sweet potato with savory toppings",
                    "prep_time": 45,
                    "calories": 580,
                    "servings": 2,
                    "icon": "🍠",
                    "dietary_tags": ["High-Carb", "Gluten-Free"],
                    "ingredients": [
                        "2 large sweet potatoes",
                        "200g ground turkey or beef",
                        "1 cup black beans",
                        "1/2 cup Greek yogurt",
                        "1/2 cup shredded cheese",
                        "1 avocado",
                        "Salsa",
                        "Seasonings"
                    ],
                    "instructions": [
                        "Bake sweet potatoes at 400°F for 40 minutes",
                        "Cook ground meat with seasonings",
                        "Warm black beans",
                        "Slice open sweet potatoes and fluff interior",
                        "Top with meat, beans, cheese, yogurt, avocado, and salsa"
                    ]
                }
            ],
            "maintenance": [
                {
                    "name": "Balanced Buddha Bowl",
                    "description": "Perfect macronutrient balance for maintaining weight",
                    "prep_time": 25,
                    "calories": 480,
                    "servings": 2,
                    "icon": "🥙",
                    "dietary_tags": ["Balanced", "Plant-Based"],
                    "ingredients": [
                        "1 cup quinoa",
                        "1 can chickpeas",
                        "2 cups kale",
                        "1 sweet potato, cubed",
                        "1/4 cup tahini",
                        "Lemon juice",
                        "Olive oil",
                        "Seasonings"
                    ],
                    "instructions": [
                        "Cook quinoa",
                        "Roast chickpeas and sweet potato at 400°F for 25 minutes",
                        "Massage kale with a little olive oil",
                        "Make tahini dressing with tahini, lemon juice, and water",
                        "Assemble bowl and drizzle with dressing"
                    ]
                },
                {
                    "name": "Salmon & Vegetables",
                    "description": "Omega-3 rich fish with roasted vegetables",
                    "prep_time": 30,
                    "calories": 450,
                    "servings": 2,
                    "icon": "🐟",
                    "dietary_tags": ["High-Protein", "Omega-3"],
                    "ingredients": [
                        "2 salmon fillets (150g each)",
                        "2 cups broccoli florets",
                        "1 cup cherry tomatoes",
                        "1 zucchini, sliced",
                        "Olive oil",
                        "Lemon",
                        "Herbs and spices"
                    ],
                    "instructions": [
                        "Preheat oven to 400°F",
                        "Arrange vegetables on baking sheet, drizzle with olive oil",
                        "Season salmon and place on same sheet",
                        "Bake for 15-20 minutes",
                        "Squeeze fresh lemon over everything before serving"
                    ]
                }
            ],
            "muscle_gain": [
                {
                    "name": "High-Protein Chicken Wrap",
                    "description": "Muscle-building wrap loaded with lean protein",
                    "prep_time": 20,
                    "calories": 620,
                    "servings": 2,
                    "icon": "🌯",
                    "dietary_tags": ["High-Protein", "High-Calorie"],
                    "ingredients": [
                        "2 large whole wheat tortillas",
                        "300g grilled chicken breast",
                        "1/2 cup hummus",
                        "1 cup mixed greens",
                        "1 cup quinoa",
                        "1/4 cup feta cheese",
                        "Cherry tomatoes",
                        "Cucumber"
                    ],
                    "instructions": [
                        "Grill and slice chicken",
                        "Cook quinoa",
                        "Spread hummus on tortillas",
                        "Layer with greens, quinoa, chicken, vegetables, and cheese",
                        "Roll tightly and slice in half"
                    ]
                },
                {
                    "name": "Post-Workout Protein Pancakes",
                    "description": "Delicious high-protein pancakes for muscle recovery",
                    "prep_time": 15,
                    "calories": 550,
                    "servings": 2,
                    "icon": "🥞",
                    "dietary_tags": ["High-Protein", "Post-Workout"],
                    "ingredients": [
                        "1 cup oat flour",
                        "2 scoops protein powder",
                        "2 eggs",
                        "1 banana, mashed",
                        "1 cup milk",
                        "1 tsp baking powder",
                        "Greek yogurt",
                        "Berries",
                        "Honey"
                    ],
                    "instructions": [
                        "Mix dry ingredients in bowl",
                        "Whisk together wet ingredients",
                        "Combine wet and dry ingredients",
                        "Cook pancakes on griddle until golden",
                        "Top with Greek yogurt, berries, and honey"
                    ]
                }
            ]
        }
    
    def _initialize_healthy_swaps(self) -> Dict:
        """Initialize healthy swaps database"""
        return {
            "sweet": [
                {
                    "name": "Dates with Almond Butter",
                    "description": "Natural sweetness from dates paired with protein-rich almond butter",
                    "calories": 150,
                    "benefits": ["Natural sugars", "Fiber", "Healthy fats"],
                    "icon": "🌰"
                },
                {
                    "name": "Greek Yogurt with Berries & Honey",
                    "description": "Creamy yogurt with natural sweetness and antioxidants",
                    "calories": 180,
                    "benefits": ["Protein", "Probiotics", "Antioxidants"],
                    "icon": "🍓"
                },
                {
                    "name": "Dark Chocolate (70%+)",
                    "description": "Rich chocolate with less sugar and more antioxidants",
                    "calories": 170,
                    "benefits": ["Antioxidants", "Lower sugar", "Mood boost"],
                    "icon": "🍫"
                },
                {
                    "name": "Banana 'Nice Cream'",
                    "description": "Frozen blended banana for a creamy, ice cream-like treat",
                    "calories": 105,
                    "benefits": ["Potassium", "No added sugar", "Vitamins"],
                    "icon": "🍌"
                }
            ],
            "salty": [
                {
                    "name": "Air-Popped Popcorn",
                    "description": "Whole grain snack with minimal calories when air-popped",
                    "calories": 120,
                    "benefits": ["Whole grain", "Fiber", "Low calorie"],
                    "icon": "🍿"
                },
                {
                    "name": "Roasted Chickpeas",
                    "description": "Crunchy, savory chickpeas packed with protein and fiber",
                    "calories": 140,
                    "benefits": ["Protein", "Fiber", "Iron"],
                    "icon": "🫘"
                },
                {
                    "name": "Seaweed Snacks",
                    "description": "Crispy seaweed sheets with natural minerals",
                    "calories": 30,
                    "benefits": ["Iodine", "Vitamins", "Very low calorie"],
                    "icon": "🌿"
                },
                {
                    "name": "Cucumber with Sea Salt",
                    "description": "Hydrating cucumber slices with a touch of quality salt",
                    "calories": 20,
                    "benefits": ["Hydration", "Minerals", "Very low calorie"],
                    "icon": "🥒"
                }
            ],
            "crunchy": [
                {
                    "name": "Raw Almonds",
                    "description": "Satisfying crunch with healthy fats and protein",
                    "calories": 160,
                    "benefits": ["Healthy fats", "Protein", "Vitamin E"],
                    "icon": "🥜"
                },
                {
                    "name": "Apple Slices with Peanut Butter",
                    "description": "Crisp apples paired with creamy, protein-rich peanut butter",
                    "calories": 190,
                    "benefits": ["Fiber", "Protein", "Vitamins"],
                    "icon": "🍎"
                },
                {
                    "name": "Carrots & Hummus",
                    "description": "Crunchy carrots with creamy, protein-packed hummus",
                    "calories": 130,
                    "benefits": ["Beta-carotene", "Protein", "Fiber"],
                    "icon": "🥕"
                },
                {
                    "name": "Rice Cakes with Avocado",
                    "description": "Light, crunchy base with creamy, nutrient-rich avocado",
                    "calories": 150,
                    "benefits": ["Healthy fats", "Fiber", "Low calorie base"],
                    "icon": "🥑"
                }
            ],
            "creamy": [
                {
                    "name": "Greek Yogurt Parfait",
                    "description": "Thick, creamy Greek yogurt layered with fresh fruit",
                    "calories": 180,
                    "benefits": ["Protein", "Probiotics", "Calcium"],
                    "icon": "🥛"
                },
                {
                    "name": "Avocado Pudding",
                    "description": "Blended avocado with cocoa for a creamy, healthy dessert",
                    "calories": 200,
                    "benefits": ["Healthy fats", "Fiber", "Vitamins"],
                    "icon": "🥑"
                },
                {
                    "name": "Cottage Cheese with Fruit",
                    "description": "Protein-rich cottage cheese with your favorite berries",
                    "calories": 150,
                    "benefits": ["High protein", "Calcium", "Vitamins"],
                    "icon": "🧀"
                },
                {
                    "name": "Chia Pudding",
                    "description": "Creamy pudding made from nutrient-dense chia seeds",
                    "calories": 170,
                    "benefits": ["Omega-3", "Fiber", "Protein"],
                    "icon": "🥥"
                }
            ],
            "chocolate": [
                {
                    "name": "Cacao Nibs",
                    "description": "Pure chocolate in its natural form, packed with antioxidants",
                    "calories": 130,
                    "benefits": ["Antioxidants", "Minerals", "No added sugar"],
                    "icon": "🍫"
                },
                {
                    "name": "Chocolate Protein Shake",
                    "description": "Satisfy chocolate cravings while meeting protein needs",
                    "calories": 200,
                    "benefits": ["Protein", "Vitamins", "Controlled portions"],
                    "icon": "🥤"
                },
                {
                    "name": "Frozen Chocolate Banana",
                    "description": "Frozen banana dipped in dark chocolate",
                    "calories": 150,
                    "benefits": ["Potassium", "Antioxidants", "Natural sweetness"],
                    "icon": "🍌"
                },
                {
                    "name": "Chocolate Almond Butter",
                    "description": "Almond butter with cacao powder mixed in",
                    "calories": 190,
                    "benefits": ["Healthy fats", "Protein", "Antioxidants"],
                    "icon": "🥜"
                }
            ],
            "fried": [
                {
                    "name": "Air-Fried Sweet Potato Fries",
                    "description": "Crispy fries made with minimal oil in an air fryer",
                    "calories": 150,
                    "benefits": ["Vitamins", "Fiber", "Less oil"],
                    "icon": "🍠"
                },
                {
                    "name": "Baked Zucchini Fries",
                    "description": "Oven-baked zucchini sticks with a crispy coating",
                    "calories": 120,
                    "benefits": ["Low calorie", "Vitamins", "Fiber"],
                    "icon": "🥒"
                },
                {
                    "name": "Oven-Baked Chicken Tenders",
                    "description": "Crispy chicken without deep frying",
                    "calories": 220,
                    "benefits": ["High protein", "Less fat", "Crispy texture"],
                    "icon": "🍗"
                },
                {
                    "name": "Roasted Chickpeas",
                    "description": "Crispy, savory alternative to fried snacks",
                    "calories": 140,
                    "benefits": ["Protein", "Fiber", "Iron"],
                    "icon": "🫘"
                }
            ]
        }
    
    def get_recipes(self, goal: str, dietary_restrictions: List[str]) -> List[Dict]:
        """Get recipes based on goal and dietary restrictions"""
        goal = goal.lower()
        
        if goal not in self.recipes_database:
            goal = "maintenance"
        
        recipes = self.recipes_database[goal].copy()
        
        # Filter by dietary restrictions if any
        if dietary_restrictions:
            filtered_recipes = []
            for recipe in recipes:
                # Check if recipe matches dietary restrictions
                recipe_tags = [tag.lower().replace("-", "_") for tag in recipe["dietary_tags"]]
                restriction_match = any(
                    restriction.lower().replace("-", "_") in recipe_tags
                    for restriction in dietary_restrictions
                )
                
                # For vegan, also filter out non-vegan items
                if "vegan" in [r.lower() for r in dietary_restrictions]:
                    # Simple vegan check
                    non_vegan_ingredients = ["chicken", "beef", "turkey", "egg", "cheese", "yogurt", "milk", "tuna", "salmon", "shrimp"]
                    ingredients_text = " ".join(recipe["ingredients"]).lower()
                    if not any(ingredient in ingredients_text for ingredient in non_vegan_ingredients):
                        filtered_recipes.append(recipe)
                elif restriction_match or not dietary_restrictions:
                    filtered_recipes.append(recipe)
            
            if filtered_recipes:
                return filtered_recipes
        
        return recipes
    
    def get_meal_plan(self, goal: str, dietary_restrictions: List[str], days: int = 7) -> List[Dict]:
        """Generate a meal plan for specified days"""
        recipes = self.get_recipes(goal, dietary_restrictions)
        
        # Define calorie targets based on goal
        calorie_targets = {
            "weight_loss": 1600,
            "weight_gain": 2800,
            "maintenance": 2200,
            "muscle_gain": 2600
        }
        
        target_calories = calorie_targets.get(goal.lower(), 2200)
        
        meal_plan = []
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        for day in range(1, min(days + 1, 8)):  # Max 7 days
            meals = []
            
            # Breakfast
            meals.append({
                "meal_type": "Breakfast",
                "time": "7:00 AM",
                "name": "Power Oatmeal Bowl" if goal != "weight_loss" else "Protein Smoothie",
                "description": "Start your day with sustained energy" if goal != "weight_loss" else "Light yet filling breakfast",
                "calories": int(target_calories * 0.25),
                "protein": 20 if goal == "muscle_gain" else 15,
                "carbs": 45 if goal == "weight_gain" else 35,
                "fats": 12,
                "icon": "🥣",
                "quick_recipe": "Oats, protein powder, berries, nuts, and honey" if goal != "weight_loss" else "Banana, protein powder, spinach, and almond milk"
            })
            
            # Lunch
            lunch_recipe = recipes[day % len(recipes)]
            meals.append({
                "meal_type": "Lunch",
                "time": "12:30 PM",
                "name": lunch_recipe["name"],
                "description": lunch_recipe["description"],
                "calories": int(target_calories * 0.35),
                "protein": 30 if goal == "muscle_gain" else 25,
                "carbs": 50 if goal == "weight_gain" else 40,
                "fats": 15,
                "icon": lunch_recipe["icon"],
                "quick_recipe": ", ".join(lunch_recipe["ingredients"][:3]) + "..."
            })
            
            # Dinner
            dinner_recipe = recipes[(day + 2) % len(recipes)]
            meals.append({
                "meal_type": "Dinner",
                "time": "7:00 PM",
                "name": dinner_recipe["name"],
                "description": dinner_recipe["description"],
                "calories": int(target_calories * 0.30),
                "protein": 35 if goal == "muscle_gain" else 28,
                "carbs": 45 if goal == "weight_gain" else 35,
                "fats": 18,
                "icon": dinner_recipe["icon"],
                "quick_recipe": ", ".join(dinner_recipe["ingredients"][:3]) + "..."
            })
            
            # Snacks
            if goal in ["weight_gain", "muscle_gain"]:
                meals.append({
                    "meal_type": "Snack",
                    "time": "3:00 PM",
                    "name": "Protein Snack",
                    "description": "Keep energy levels high throughout the day",
                    "calories": int(target_calories * 0.10),
                    "protein": 15,
                    "carbs": 20,
                    "fats": 8,
                    "icon": "🥜",
                    "quick_recipe": "Greek yogurt with nuts and fruit"
                })
            
            tips = [
                "Stay hydrated! Aim for 8 glasses of water today.",
                "Don't skip meals - consistency is key for your goals.",
                "Listen to your body's hunger cues.",
                "Prep tomorrow's meals tonight to stay on track.",
                "Add variety with different vegetables each day.",
                "Include a colorful variety of fruits and vegetables.",
                "Remember: it's about progress, not perfection!"
            ]
            
            meal_plan.append({
                "day": day,
                "day_name": day_names[day - 1],
                "total_calories": sum(meal["calories"] for meal in meals),
                "meals": meals,
                "tips": tips[(day - 1) % len(tips)]
            })
        
        return meal_plan
    
    def get_healthy_swaps(self, craving: str) -> List[Dict]:
        """Get healthy alternatives for specific cravings"""
        craving = craving.lower()
        
        if craving not in self.healthy_swaps_database:
            craving = "sweet"
        
        return self.healthy_swaps_database[craving]