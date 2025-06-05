"""
This file defines the database models
"""

from pydal.validators import *
import datetime

from .common import Field, db, auth

### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later
#
# db.commit()
#


# ingredient table

db.define_table(
        'ingredient',
        Field('name', 'string', length=64, unique=True, requires=[IS_NOT_EMPTY(), IS_LENGTH(64)]),
        Field('unit', 'string', requires=IS_IN_SET(['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'piece', 'bunch','stick', 'slice', 'pinch', 'clove', 'can','jar', 'pack', 'sheet', 'head', 'leaf', 'filet', 'sprig'])),
        Field('description', 'text', requires=IS_LENGTH(500)),
        Field('calories_per_unit', 'double', requires=IS_FLOAT_IN_RANGE(0, 10000)),
        Field('protein_per_unit', 'double', requires=IS_FLOAT_IN_RANGE(0, 10000)),
        Field('fat_per_unit', 'double', requires=IS_FLOAT_IN_RANGE(0, 10000)),
        Field('carbs_per_unit', 'double', requires=IS_FLOAT_IN_RANGE(0, 10000)),
        Field('sugar_per_unit', 'double', requires=IS_FLOAT_IN_RANGE(0, 10000)),
        Field('fiber_per_unit', 'double', requires=IS_FLOAT_IN_RANGE(0, 10000)),
        Field('sodium_per_unit', 'double', requires=IS_FLOAT_IN_RANGE(0, 10000)),
        auth.signature,
        format='%(name)s'
)

db.define_table(
    'recipe', 
    Field('name', 'string', length=100, requires=[IS_NOT_EMPTY(), IS_LENGTH(100)]),
    Field('type', 'string', requires=IS_IN_SET(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'])),
    Field('description', 'text', requires=IS_LENGTH(1000)),
    Field('image', 'string', length=500, default=None),
    Field('author', 'reference auth_user'),
    Field('instruction_steps', 'text', requires=IS_NOT_EMPTY()),
    Field('servings', 'integer', requires=IS_INT_IN_RANGE(1, 100)),
    auth.signature, 
    format='%(name)s'
)

db.define_table(
    'recipe_ingredient',
    Field('recipe_id', 'reference recipe', requires=IS_NOT_EMPTY()),
    Field('ingredient_id', 'reference ingredient', requires=IS_NOT_EMPTY()),
    Field('quantity_per_serving', 'double', requires=IS_FLOAT_IN_RANGE(0.01, 10000)),
    auth.signature, 
    format='%(ingredient_id)s'
)

db.define_table(
    'contact',
    Field('name', 'string', length=100, requires=[IS_NOT_EMPTY(), IS_LENGTH(100)]),
    Field('email', 'string', length=255, requires=[IS_NOT_EMPTY(), IS_EMAIL()]),
    Field('subject', 'string', length=200, requires=[IS_NOT_EMPTY(), IS_LENGTH(200)]),
    Field('message', 'text', requires=[IS_NOT_EMPTY(), IS_LENGTH(2000)]),
    Field('status', 'string', default='new', requires=IS_IN_SET(['new', 'in_progress', 'resolved'])),
    auth.signature,
    format='%(subject)s'
)


# extra credit: multiple images per recipe

db.define_table(
    'recipe_multiple_images',
    Field('recipe_id', 'reference recipe', requires=IS_NOT_EMPTY()),
    Field('multi_images', 'upload', requires=IS_NOT_EMPTY()),
    auth.signature,
    format='%(multi_images)s'
)

db.commit()

# ==============================================================
# -------------- AUTOMATIC THEMEALDB IMPORT -------------------
# ==============================================================

def auto_import_themealdb():
    """
    Automatically import recipes from TheMealDB API on first startup
    This runs once when the app starts and populates the database
    """
    try:
        # Check if import has already been done
        existing_recipes = db(db.recipe.description.like('%TheMealDB%')).count()
        if existing_recipes > 0:
            print(f"[TheMealDB] Import already completed. Found {existing_recipes} recipes.")
            return
        
        print("[TheMealDB] Starting automatic import...")
        
        import requests
        import time
        import re
        from datetime import datetime
        
        recipes_imported = 0
        ingredients_imported = 0
        
        # TheMealDB API endpoints
        THEMEALDB_BASE = "https://www.themealdb.com/api/json/v1/1"
        
        # Create admin user for TheMealDB recipes
        admin_user = db(db.auth_user.email == 'admin@themealdb.com').select().first()
        if not admin_user:
            admin_user_id = db.auth_user.insert(
                first_name='TheMealDB',
                last_name='Admin',
                email='admin@themealdb.com',
                password='dummy_password'
            )
            print("[TheMealDB] Created admin user")
        else:
            admin_user_id = admin_user.id
        
        # Helper functions for realistic nutritional values
        def get_default_calories(ingredient_name):
            ingredient_lower = ingredient_name.lower()
            if any(word in ingredient_lower for word in ['oil', 'butter', 'fat']):
                return 9  # 9 calories per gram for fats
            elif any(word in ingredient_lower for word in ['sugar', 'honey', 'syrup']):
                return 4  # 4 calories per gram for sugars
            elif any(word in ingredient_lower for word in ['meat', 'beef', 'pork', 'chicken', 'fish']):
                return 2  # 2 calories per gram for proteins
            elif any(word in ingredient_lower for word in ['vegetable', 'lettuce', 'spinach', 'celery']):
                return 0.2   # 0.2 calories per gram for low calorie vegetables
            elif any(word in ingredient_lower for word in ['rice', 'pasta', 'bread', 'flour']):
                return 3.5  # 3.5 calories per gram for carbohydrates
            elif any(word in ingredient_lower for word in ['egg']):
                return 1.5  # 1.5 calories per gram for eggs
            else:
                return 0.5   # Default low calories
        
        def get_default_protein(ingredient_name):
            ingredient_lower = ingredient_name.lower()
            if any(word in ingredient_lower for word in ['meat', 'beef', 'pork', 'chicken', 'fish']):
                return 0.20  # 20% protein
            elif any(word in ingredient_lower for word in ['egg']):
                return 0.13  # 13% protein
            elif any(word in ingredient_lower for word in ['cheese', 'milk', 'yogurt']):
                return 0.10  # 10% protein
            else:
                return 0.02   # Default 2% protein
        
        def get_default_fat(ingredient_name):
            ingredient_lower = ingredient_name.lower()
            if any(word in ingredient_lower for word in ['oil', 'butter', 'fat']):
                return 1.0  # 100% fat
            elif any(word in ingredient_lower for word in ['nuts', 'seeds']):
                return 0.50  # 50% fat for nuts
            elif any(word in ingredient_lower for word in ['meat', 'cheese']):
                return 0.15  # 15% fat
            elif any(word in ingredient_lower for word in ['egg']):
                return 0.10  # 10% fat
            else:
                return 0.01   # Default 1% fat
        
        def get_default_carbs(ingredient_name):
            ingredient_lower = ingredient_name.lower()
            if any(word in ingredient_lower for word in ['sugar', 'honey', 'syrup']):
                return 1.0  # 100% carbs
            elif any(word in ingredient_lower for word in ['rice', 'pasta', 'bread', 'flour']):
                return 0.70   # 70% carbs for grains
            elif any(word in ingredient_lower for word in ['fruit', 'apple', 'banana']):
                return 0.15   # 15% carbs for fruits
            elif any(word in ingredient_lower for word in ['vegetable']):
                return 0.05   # 5% carbs for vegetables
            else:
                return 0.05    # Default 5% carbs
        
        def get_default_sugar(ingredient_name):
            ingredient_lower = ingredient_name.lower()
            if any(word in ingredient_lower for word in ['sugar', 'honey', 'syrup']):
                return 0.95  # 95% sugar for pure sugars
            elif any(word in ingredient_lower for word in ['fruit', 'apple', 'banana']):
                return 0.10   # 10% sugar for fruits
            elif any(word in ingredient_lower for word in ['tomato']):
                return 0.03   # 3% sugar for tomatoes
            else:
                return 0.01    # Default 1% sugar
        
        def get_default_fiber(ingredient_name):
            ingredient_lower = ingredient_name.lower()
            if any(word in ingredient_lower for word in ['fruit', 'apple', 'banana']):
                return 0.03   # 3% fiber for fruits
            elif any(word in ingredient_lower for word in ['vegetable', 'cabbage', 'carrot']):
                return 0.03   # 3% fiber for vegetables
            elif any(word in ingredient_lower for word in ['rice', 'pasta', 'bread', 'flour']):
                return 0.02   # 2% fiber for grains
            else:
                return 0.01    # Default 1% fiber
        
        def get_default_sodium(ingredient_name):
            ingredient_lower = ingredient_name.lower()
            if any(word in ingredient_lower for word in ['bacon', 'sausage', 'kielbasa']):
                return 0.8  # 800mg per 100g for processed meats
            elif any(word in ingredient_lower for word in ['cheese']):
                return 0.6  # 600mg per 100g for cheese
            elif any(word in ingredient_lower for word in ['stock', 'broth']):
                return 0.4  # 400mg per 100g for stock
            elif any(word in ingredient_lower for word in ['meat', 'beef', 'pork', 'chicken', 'fish']):
                return 0.07  # 70mg per 100g for fresh meats
            elif any(word in ingredient_lower for word in ['vegetable']):
                return 0.01  # 10mg per 100g for vegetables
            else:
                return 0.02    # Default 20mg per 100g
        
        def parse_quantity(measure_string):
            try:
                measure_lower = measure_string.lower().strip()
                
                # Handle common descriptive measurements
                if any(phrase in measure_lower for phrase in ['to taste', 'for frying', 'for cooking', 'as needed']):
                    return 5.0  # Small default amount for seasonings/oils
                
                if 'large' in measure_lower:
                    return 200.0  # Large item (like 1 large eggplant = ~200g)
                elif 'medium' in measure_lower:
                    return 150.0  # Medium item
                elif 'small' in measure_lower:
                    return 100.0  # Small item
                
                numbers = re.findall(r'\d+\.?\d*', measure_string)
                if numbers:
                    quantity = float(numbers[0])
                    
                    if '/' in measure_string:
                        fraction_parts = re.findall(r'(\d+)/(\d+)', measure_string)
                        if fraction_parts:
                            num, den = fraction_parts[0]
                            quantity = float(num) / float(den)
                    
                    # Convert common units to grams (more realistic conversions)
                    if 'cup' in measure_lower:
                        quantity *= 120  # 1 cup ≈ 120g (more realistic for dry ingredients)
                    elif 'tbsp' in measure_lower or 'tablespoon' in measure_lower:
                        quantity *= 15
                    elif 'tsp' in measure_lower or 'teaspoon' in measure_lower:
                        quantity *= 5
                    elif 'oz' in measure_lower:
                        quantity *= 28
                    elif 'lb' in measure_lower or 'pound' in measure_lower:
                        quantity *= 454
                    elif 'ml' in measure_lower:
                        quantity *= 1
                    elif 'l' in measure_lower and 'ml' not in measure_lower:
                        quantity *= 1000
                    elif 'g' in measure_lower and 'kg' not in measure_lower:
                        # If it's already in grams, check if it's reasonable
                        if quantity > 500:  # If more than 500g, likely for whole recipe, divide by servings
                            quantity = quantity / 4  # Assume 4 servings
                    elif 'kg' in measure_lower:
                        quantity *= 250  # 1 kg divided by 4 servings = 250g per serving
                    
                    # Cap maximum quantity per serving to reasonable amounts
                    return min(max(quantity, 1.0), 300.0)  # Between 1g and 300g per serving
                else:
                    # No numbers found, return reasonable default based on context
                    if any(word in measure_lower for word in ['pinch', 'dash']):
                        return 2.0
                    elif any(word in measure_lower for word in ['clove', 'piece']):
                        return 10.0
                    else:
                        return 50.0  # Default moderate amount
            except Exception:
                return 100.0
        
        # Import ingredients first
        print("[TheMealDB] Importing ingredients...")
        try:
            ingredients_response = requests.get(f"{THEMEALDB_BASE}/list.php?i=list", timeout=15)
            if ingredients_response.status_code == 200:
                ingredients_data = ingredients_response.json()
                
                for ingredient_item in ingredients_data.get('meals', [])[:100]:
                    ingredient_name = ingredient_item.get('strIngredient', '').strip()
                    if not ingredient_name:
                        continue
                        
                    existing = db(db.ingredient.name.ilike(ingredient_name)).select().first()
                    if existing:
                        continue
                    
                    db.ingredient.insert(
                        name=ingredient_name,
                        unit='g',
                        description=f'Ingredient imported from TheMealDB',
                        calories_per_unit=get_default_calories(ingredient_name),
                        protein_per_unit=get_default_protein(ingredient_name),
                        fat_per_unit=get_default_fat(ingredient_name),
                        carbs_per_unit=get_default_carbs(ingredient_name),
                        sugar_per_unit=get_default_sugar(ingredient_name),
                        fiber_per_unit=get_default_fiber(ingredient_name),
                        sodium_per_unit=get_default_sodium(ingredient_name)
                    )
                    ingredients_imported += 1
                    
                    if ingredients_imported % 20 == 0:
                        print(f"[TheMealDB] Imported {ingredients_imported} ingredients...")
                    
                    time.sleep(0.05)  # Faster rate limiting for startup
                    
        except Exception as e:
            print(f"[TheMealDB] Error importing ingredients: {e}")
        
        # Import recipes
        print("[TheMealDB] Importing recipes...")
        categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian']
        category_mapping = {
            'Beef': 'Dinner',
            'Chicken': 'Dinner', 
            'Dessert': 'Dessert',
            'Lamb': 'Dinner',
            'Pasta': 'Dinner',
            'Pork': 'Dinner',
            'Seafood': 'Dinner',
            'Vegetarian': 'Lunch'
        }
        
        for category in categories:
            try:
                response = requests.get(f"{THEMEALDB_BASE}/filter.php?c={category}", timeout=15)
                if response.status_code != 200:
                    continue
                
                data = response.json()
                meals = data.get('meals', [])[:5]  # 5 recipes per category for faster startup
                
                for meal in meals:
                    meal_id = meal.get('idMeal')
                    if not meal_id:
                        continue
                    
                    try:
                        detail_response = requests.get(f"{THEMEALDB_BASE}/lookup.php?i={meal_id}", timeout=15)
                        if detail_response.status_code != 200:
                            continue
                            
                        detail_data = detail_response.json()
                        recipe_detail = detail_data.get('meals', [{}])[0]
                        
                        if not recipe_detail:
                            continue
                        
                        recipe_name = recipe_detail.get('strMeal', '').strip()
                        recipe_category = recipe_detail.get('strCategory', category)
                        recipe_instructions = recipe_detail.get('strInstructions', '').strip()
                        recipe_area = recipe_detail.get('strArea', '')
                        
                        if not recipe_name or not recipe_instructions:
                            continue
                        
                        existing_recipe = db(db.recipe.name.ilike(recipe_name)).select().first()
                        if existing_recipe:
                            continue
                        
                        mapped_category = category_mapping.get(recipe_category, 'Dinner')
                        
                        description = f"Delicious {recipe_name} recipe imported from TheMealDB."
                        if recipe_area:
                            description += f" Traditional {recipe_area} cuisine."
                        description += f" Category: {recipe_category}."
                        
                        recipe_id = db.recipe.insert(
                            name=recipe_name,
                            type=mapped_category,
                            description=description,
                            instruction_steps=recipe_instructions,
                            servings=4,
                            image=recipe_detail.get('strMealThumb', ''),  # Store the MealDB image URL
                            author=admin_user_id,
                            created_on=datetime.utcnow()
                        )
                        
                        # Add ingredients to recipe
                        for i in range(1, 21):
                            ingredient_name = recipe_detail.get(f'strIngredient{i}', '').strip()
                            ingredient_measure = recipe_detail.get(f'strMeasure{i}', '').strip()
                            
                            if not ingredient_name or not ingredient_measure:
                                continue
                            
                            ingredient = db(db.ingredient.name.ilike(ingredient_name)).select().first()
                            if not ingredient:
                                ingredient_id = db.ingredient.insert(
                                    name=ingredient_name,
                                    unit='g',
                                    description=f'Ingredient from TheMealDB recipe: {recipe_name}',
                                    calories_per_unit=get_default_calories(ingredient_name),
                                    protein_per_unit=get_default_protein(ingredient_name),
                                    fat_per_unit=get_default_fat(ingredient_name),
                                    carbs_per_unit=get_default_carbs(ingredient_name),
                                    sugar_per_unit=get_default_sugar(ingredient_name),
                                    fiber_per_unit=get_default_fiber(ingredient_name),
                                    sodium_per_unit=get_default_sodium(ingredient_name)
                                )
                                ingredients_imported += 1
                            else:
                                ingredient_id = ingredient.id
                            
                            quantity = parse_quantity(ingredient_measure)
                            
                            db.recipe_ingredient.insert(
                                recipe_id=recipe_id,
                                ingredient_id=ingredient_id,
                                quantity_per_serving=quantity
                            )
                        
                        recipes_imported += 1
                        print(f"[TheMealDB] Imported: {recipe_name}")
                        
                        time.sleep(0.2)  # Faster rate limiting
                        
                    except Exception as e:
                        continue
                
                time.sleep(0.5)  # Brief pause between categories
                
            except Exception as e:
                continue
        
        # Commit all changes
        db.commit()
        
        print(f"[TheMealDB] Import completed! {recipes_imported} recipes, {ingredients_imported} ingredients")
        
    except Exception as e:
        print(f"[TheMealDB] Import failed: {e}")
        # Don't crash the app if import fails
        pass

# Run the automatic import
try:
    # Only import if requests is available
    import requests
    auto_import_themealdb()
except ImportError:
    print("[TheMealDB] Skipping import - requests library not available")
    print("[TheMealDB] Install with: pip install requests")
except Exception as e:
    print(f"[TheMealDB] Import error: {e}")

