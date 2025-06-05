#!/usr/bin/env python3
"""
TheMealDB Import Script for Custom Recipe Manager

This script imports recipes and ingredients from TheMealDB API into the database.
It should only be run once to populate the database with initial data.

Usage:
    python import_themealdb.py

Requirements:
    - requests library: pip install requests
    - py4web environment setup
"""

import requests
import json
import time
import sys
import os
from datetime import datetime
import re

# Add the py4web path to import the database
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

try:
    from apps.CustomRecipeManager.models import db
    from apps.CustomRecipeManager.common import auth
except ImportError as e:
    print(f"Error importing database models: {e}")
    print("Make sure you're running this script from the py4web backend directory")
    sys.exit(1)

class TheMealDBImporter:
    def __init__(self):
        self.base_url = "https://www.themealdb.com/api/json/v1/1"
        self.recipes_imported = 0
        self.ingredients_imported = 0
        self.errors = []
        
    def log(self, message):
        """Simple logging function"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def cleanup_existing_data(self):
        """Clean up existing TheMealDB data to allow fresh import"""
        try:
            self.log("Cleaning up existing TheMealDB data...")
            
            # Delete TheMealDB recipes and their ingredients
            themealdb_recipes = db(db.recipe.description.like('%TheMealDB%')).select()
            recipe_count = len(themealdb_recipes)
            
            for recipe in themealdb_recipes:
                # Delete recipe ingredients
                db(db.recipe_ingredient.recipe_id == recipe.id).delete()
                # Delete the recipe
                db(db.recipe.id == recipe.id).delete()
            
            # Delete TheMealDB ingredients (those with TheMealDB in description)
            themealdb_ingredients = db(db.ingredient.description.like('%TheMealDB%')).select()
            ingredient_count = len(themealdb_ingredients)
            
            for ingredient in themealdb_ingredients:
                db(db.ingredient.id == ingredient.id).delete()
            
            # Delete TheMealDB admin user
            admin_user = db(db.auth_user.email == 'admin@themealdb.com').select().first()
            if admin_user:
                db(db.auth_user.id == admin_user.id).delete()
            
            db.commit()
            self.log(f"Cleaned up {recipe_count} recipes and {ingredient_count} ingredients")
            return True
            
        except Exception as e:
            self.log(f"Error during cleanup: {e}")
            return False
    
    def check_existing_import(self):
        """Check if TheMealDB data has already been imported"""
        try:
            existing_recipes = db(db.recipe.description.like('%TheMealDB%')).count()
            if existing_recipes > 0:
                self.log(f"Found {existing_recipes} existing TheMealDB recipes in database.")
                return True
            return False
        except Exception as e:
            self.log(f"Error checking existing import: {e}")
            return False
    
    def create_admin_user(self):
        """Create or get admin user for TheMealDB recipes"""
        try:
            admin_user = db(db.auth_user.email == 'admin@themealdb.com').select().first()
            if not admin_user:
                admin_user_id = db.auth_user.insert(
                    first_name='TheMealDB',
                    last_name='Admin',
                    email='admin@themealdb.com',
                    password='dummy_password'
                )
                self.log("Created TheMealDB admin user")
                return admin_user_id
            else:
                return admin_user.id
        except Exception as e:
            self.log(f"Error creating admin user: {e}")
            return None
    
    def import_ingredients(self):
        """Import ingredients from TheMealDB"""
        self.log("Fetching ingredients from TheMealDB...")
        
        try:
            response = requests.get(f"{self.base_url}/list.php?i=list", timeout=15)
            if response.status_code != 200:
                self.log(f"Failed to fetch ingredients: HTTP {response.status_code}")
                return
                
            data = response.json()
            ingredients = data.get('meals', [])[:100]  # Limit to 100 ingredients
            
            self.log(f"Found {len(ingredients)} ingredients to import")
            
            for ingredient_item in ingredients:
                ingredient_name = ingredient_item.get('strIngredient', '').strip()
                if not ingredient_name:
                    continue
                    
                # Check if ingredient already exists
                existing = db(db.ingredient.name.ilike(ingredient_name)).select().first()
                if existing:
                    continue
                
                try:
                    # Create new ingredient with realistic default values
                    db.ingredient.insert(
                        name=ingredient_name,
                        unit='g',  # Default unit
                        description=f'Ingredient imported from TheMealDB',
                        calories_per_unit=self._get_default_calories(ingredient_name),
                        protein_per_unit=self._get_default_protein(ingredient_name),
                        fat_per_unit=self._get_default_fat(ingredient_name),
                        carbs_per_unit=self._get_default_carbs(ingredient_name),
                        sugar_per_unit=self._get_default_sugar(ingredient_name),
                        fiber_per_unit=self._get_default_fiber(ingredient_name),
                        sodium_per_unit=self._get_default_sodium(ingredient_name)
                    )
                    self.ingredients_imported += 1
                    
                    if self.ingredients_imported % 10 == 0:
                        self.log(f"Imported {self.ingredients_imported} ingredients...")
                        
                except Exception as e:
                    self.errors.append(f"Error importing ingredient {ingredient_name}: {str(e)}")
                
                time.sleep(0.1)  # Rate limiting
                
            self.log(f"Completed ingredient import: {self.ingredients_imported} ingredients")
            
        except Exception as e:
            self.log(f"Error importing ingredients: {e}")
            self.errors.append(f"Ingredient import failed: {str(e)}")
    
    def _get_default_calories(self, ingredient_name):
        """Get realistic default calories based on ingredient type"""
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
    
    def _get_default_protein(self, ingredient_name):
        """Get realistic default protein based on ingredient type"""
        ingredient_lower = ingredient_name.lower()
        
        if any(word in ingredient_lower for word in ['meat', 'beef', 'pork', 'chicken', 'fish']):
            return 0.20  # 20% protein
        elif any(word in ingredient_lower for word in ['egg']):
            return 0.13  # 13% protein
        elif any(word in ingredient_lower for word in ['cheese', 'milk', 'yogurt']):
            return 0.10  # 10% protein
        else:
            return 0.02   # Default 2% protein
    
    def _get_default_fat(self, ingredient_name):
        """Get realistic default fat based on ingredient type"""
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
    
    def _get_default_carbs(self, ingredient_name):
        """Get realistic default carbs based on ingredient type"""
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
    
    def _get_default_sugar(self, ingredient_name):
        """Get realistic default sugar based on ingredient type"""
        ingredient_lower = ingredient_name.lower()
        
        if any(word in ingredient_lower for word in ['sugar', 'honey', 'syrup']):
            return 0.95  # 95% sugar for pure sugars
        elif any(word in ingredient_lower for word in ['fruit', 'apple', 'banana']):
            return 0.10   # 10% sugar for fruits
        elif any(word in ingredient_lower for word in ['tomato']):
            return 0.03   # 3% sugar for tomatoes
        else:
            return 0.01    # Default 1% sugar
    
    def _get_default_fiber(self, ingredient_name):
        """Get realistic default fiber based on ingredient type"""
        ingredient_lower = ingredient_name.lower()
        
        if any(word in ingredient_lower for word in ['fruit', 'apple', 'banana']):
            return 0.03   # 3% fiber for fruits
        elif any(word in ingredient_lower for word in ['vegetable', 'cabbage', 'carrot']):
            return 0.03   # 3% fiber for vegetables
        elif any(word in ingredient_lower for word in ['rice', 'pasta', 'bread', 'flour']):
            return 0.02   # 2% fiber for grains
        else:
            return 0.01    # Default 1% fiber
    
    def _get_default_sodium(self, ingredient_name):
        """Get realistic default sodium based on ingredient type"""
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
    
    def import_recipes(self):
        """Import recipes from TheMealDB"""
        admin_user_id = self.create_admin_user()
        if not admin_user_id:
            self.log("Failed to create admin user, aborting recipe import")
            return
        
        # Categories to import from
        categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian', 'Breakfast']
        
        # Category mapping to our system
        category_mapping = {
            'Beef': 'Dinner',
            'Chicken': 'Dinner', 
            'Dessert': 'Dessert',
            'Lamb': 'Dinner',
            'Pasta': 'Dinner',
            'Pork': 'Dinner',
            'Seafood': 'Dinner',
            'Vegetarian': 'Lunch',
            'Breakfast': 'Breakfast',
            'Side': 'Snack'
        }
        
        for category in categories:
            self.log(f"Importing {category} recipes...")
            
            try:
                # Get recipes from category
                response = requests.get(f"{self.base_url}/filter.php?c={category}", timeout=15)
                if response.status_code != 200:
                    self.log(f"Failed to fetch {category} recipes: HTTP {response.status_code}")
                    continue
                
                data = response.json()
                meals = data.get('meals', [])[:6]  # Limit to 6 recipes per category
                
                self.log(f"Found {len(meals)} {category} recipes to import")
                
                for meal in meals:
                    meal_id = meal.get('idMeal')
                    if not meal_id:
                        continue
                    
                    try:
                        # Get detailed recipe information
                        detail_response = requests.get(f"{self.base_url}/lookup.php?i={meal_id}", timeout=15)
                        if detail_response.status_code != 200:
                            continue
                            
                        detail_data = detail_response.json()
                        recipe_detail = detail_data.get('meals', [{}])[0]
                        
                        if not recipe_detail:
                            continue
                        
                        # Extract recipe data
                        recipe_name = recipe_detail.get('strMeal', '').strip()
                        recipe_category = recipe_detail.get('strCategory', category)
                        recipe_instructions = recipe_detail.get('strInstructions', '').strip()
                        recipe_area = recipe_detail.get('strArea', '')
                        
                        if not recipe_name or not recipe_instructions:
                            continue
                        
                        # Check if recipe already exists
                        existing_recipe = db(db.recipe.name.ilike(recipe_name)).select().first()
                        if existing_recipe:
                            continue
                        
                        mapped_category = category_mapping.get(recipe_category, 'Dinner')
                        
                        # Create recipe description
                        description = f"Delicious {recipe_name} recipe imported from TheMealDB."
                        if recipe_area:
                            description += f" Traditional {recipe_area} cuisine."
                        description += f" Category: {recipe_category}."
                        
                        # Create recipe
                        recipe_id = db.recipe.insert(
                            name=recipe_name,
                            type=mapped_category,
                            description=description,
                            instruction_steps=recipe_instructions,
                            servings=4,  # Default servings
                            image=recipe_detail.get('strMealThumb', ''),  # Use original MealDB image URL
                            author=admin_user_id,
                            created_on=datetime.utcnow()
                        )
                        
                        # Import ingredients for this recipe
                        self._import_recipe_ingredients(recipe_detail, recipe_id, recipe_name)
                        
                        self.recipes_imported += 1
                        self.log(f"Imported recipe: {recipe_name}")
                        
                        time.sleep(0.5)  # Rate limiting
                        
                    except Exception as e:
                        self.errors.append(f"Error importing recipe {meal_id}: {str(e)}")
                        continue
                
                time.sleep(1)  # Rate limiting between categories
                
            except Exception as e:
                self.log(f"Error fetching {category} recipes: {e}")
                self.errors.append(f"Category {category} import failed: {str(e)}")
                continue
        
        self.log(f"Completed recipe import: {self.recipes_imported} recipes")
    
    def _import_recipe_ingredients(self, recipe_detail, recipe_id, recipe_name):
        """Import ingredients for a specific recipe"""
        for i in range(1, 21):  # TheMealDB has up to 20 ingredients
            ingredient_name = recipe_detail.get(f'strIngredient{i}', '').strip()
            ingredient_measure = recipe_detail.get(f'strMeasure{i}', '').strip()
            
            if not ingredient_name or not ingredient_measure:
                continue
            
            # Find or create ingredient
            ingredient = db(db.ingredient.name.ilike(ingredient_name)).select().first()
            if not ingredient:
                ingredient_id = db.ingredient.insert(
                    name=ingredient_name,
                    unit='g',
                    description=f'Ingredient from TheMealDB recipe: {recipe_name}',
                    calories_per_unit=self._get_default_calories(ingredient_name),
                    protein_per_unit=self._get_default_protein(ingredient_name),
                    fat_per_unit=self._get_default_fat(ingredient_name),
                    carbs_per_unit=self._get_default_carbs(ingredient_name),
                    sugar_per_unit=self._get_default_sugar(ingredient_name),
                    fiber_per_unit=self._get_default_fiber(ingredient_name),
                    sodium_per_unit=self._get_default_sodium(ingredient_name)
                )
                self.ingredients_imported += 1
            else:
                ingredient_id = ingredient.id
            
            # Parse quantity from measure string
            quantity = self._parse_quantity(ingredient_measure)
            
            # Add ingredient to recipe
            try:
                db.recipe_ingredient.insert(
                    recipe_id=recipe_id,
                    ingredient_id=ingredient_id,
                    quantity_per_serving=quantity
                )
            except Exception as e:
                self.errors.append(f"Error adding ingredient {ingredient_name} to recipe {recipe_name}: {str(e)}")
    
    def _parse_quantity(self, measure_string):
        """Parse quantity from TheMealDB measure string"""
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
            
            # Extract numbers from measure string
            numbers = re.findall(r'\d+\.?\d*', measure_string)
            if numbers:
                quantity = float(numbers[0])
                
                # Handle fractions
                if '/' in measure_string:
                    fraction_parts = re.findall(r'(\d+)/(\d+)', measure_string)
                    if fraction_parts:
                        num, den = fraction_parts[0]
                        quantity = float(num) / float(den)
                
                # Convert common units to grams (more realistic conversions)
                if 'cup' in measure_lower:
                    quantity *= 120  # 1 cup ≈ 120g (more realistic for dry ingredients)
                elif 'tbsp' in measure_lower or 'tablespoon' in measure_lower:
                    quantity *= 15   # 1 tbsp ≈ 15g
                elif 'tsp' in measure_lower or 'teaspoon' in measure_lower:
                    quantity *= 5    # 1 tsp ≈ 5g
                elif 'oz' in measure_lower:
                    quantity *= 28   # 1 oz ≈ 28g
                elif 'lb' in measure_lower or 'pound' in measure_lower:
                    quantity *= 454  # 1 lb ≈ 454g
                elif 'ml' in measure_lower:
                    quantity *= 1    # 1 ml ≈ 1g for liquids
                elif 'l' in measure_lower and 'ml' not in measure_lower:
                    quantity *= 1000 # 1 l ≈ 1000g
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
            return 50.0  # Safe fallback
    
    def run_import(self, force_reimport=False):
        """Run the complete import process"""
        self.log("Starting TheMealDB import process...")
        
        # Check if already imported
        if self.check_existing_import():
            if force_reimport:
                self.log("Force re-import requested. Cleaning up existing data...")
                if not self.cleanup_existing_data():
                    return {
                        "success": False,
                        "message": "Failed to cleanup existing data",
                        "recipes_imported": 0,
                        "ingredients_imported": 0
                    }
            else:
                return {
                    "success": False,
                    "message": "Import already completed. Use force_reimport=True to re-import with updated data.",
                    "recipes_imported": 0,
                    "ingredients_imported": 0
                }
        
        try:
            # Import ingredients first
            self.import_ingredients()
            
            # Import recipes
            self.import_recipes()
            
            # Commit all changes
            db.commit()
            
            self.log("Import completed successfully!")
            self.log(f"Total recipes imported: {self.recipes_imported}")
            self.log(f"Total ingredients imported: {self.ingredients_imported}")
            
            if self.errors:
                self.log(f"Encountered {len(self.errors)} errors during import")
                for error in self.errors[:5]:  # Show first 5 errors
                    self.log(f"Error: {error}")
            
            return {
                "success": True,
                "message": f"Successfully imported {self.recipes_imported} recipes and {self.ingredients_imported} ingredients",
                "recipes_imported": self.recipes_imported,
                "ingredients_imported": self.ingredients_imported,
                "errors": self.errors
            }
            
        except Exception as e:
            self.log(f"Import failed with error: {e}")
            return {
                "success": False,
                "message": f"Import failed: {str(e)}",
                "recipes_imported": self.recipes_imported,
                "ingredients_imported": self.ingredients_imported
            }

def main():
    """Main function to run the import"""
    print("=" * 60)
    print("TheMealDB Import Script for Custom Recipe Manager")
    print("=" * 60)
    
    # Check if requests is available
    try:
        import requests
    except ImportError:
        print("Error: 'requests' library not found. Please install it with: pip install requests")
        sys.exit(1)
    
    # Check for force re-import flag
    force_reimport = len(sys.argv) > 1 and sys.argv[1] == '--force'
    
    if force_reimport:
        print("Force re-import mode enabled. This will delete existing TheMealDB data and re-import.")
        response = input("Are you sure you want to continue? (y/N): ")
        if response.lower() != 'y':
            print("Import cancelled.")
            sys.exit(0)
    
    # Run the import
    importer = TheMealDBImporter()
    result = importer.run_import(force_reimport=force_reimport)
    
    print("\n" + "=" * 60)
    print("IMPORT SUMMARY")
    print("=" * 60)
    print(f"Success: {result['success']}")
    print(f"Message: {result['message']}")
    print(f"Recipes imported: {result['recipes_imported']}")
    print(f"Ingredients imported: {result['ingredients_imported']}")
    
    if result.get('errors'):
        print(f"Errors encountered: {len(result['errors'])}")
    
    print("=" * 60)
    
    if force_reimport and result['success']:
        print("\nNOTE: Nutritional values have been corrected!")
        print("The previous import had inflated nutritional values due to parsing errors.")
        print("New values should be much more realistic (e.g., ~300-600 calories per serving).")
        print("=" * 60)

if __name__ == "__main__":
    main() 