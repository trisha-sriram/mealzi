import requests
import os
import sys
from datetime import datetime
from .models import db, auth

def download_image(url, recipe_name, is_ingredient=False):
    """Download image from URL and save to uploads directory"""
    try:
        # For meal thumbnails, append /small to get the small version
        if not is_ingredient and 'themealdb.com/images/media/meals' in url:
            url = f"{url}/small"
        # For ingredient images, use the small version
        elif is_ingredient and 'themealdb.com/images/ingredients' in url:
            url = url.replace('.png', '-small.png')
        
        print(f"Downloading image from: {url}")  # Debug print
        response = requests.get(url)
        if response.status_code == 200:
            # Create uploads directory if it doesn't exist
            uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            
            # Create filename from recipe name and add timestamp to ensure uniqueness
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{recipe_name.lower().replace(' ', '_')}_{timestamp}.jpg"
            filepath = os.path.join(uploads_dir, filename)
            
            # Save the image
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"Successfully saved image to: {filepath}")  # Debug print
            return filename
        else:
            print(f"Failed to download image. Status code: {response.status_code}")  # Debug print
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def get_ingredient_image_url(ingredient_name):
    """Get the URL for an ingredient image from TheMealDB"""
    # Convert ingredient name to lowercase and replace spaces with underscores
    formatted_name = ingredient_name.lower().replace(' ', '_')
    return f"https://www.themealdb.com/images/ingredients/{formatted_name}.png"

def import_mealdb_recipes():
    """Import recipes from TheMealDB API"""
    print("Starting recipe import from TheMealDB...")
    
    # Get all meals from TheMealDB
    response = requests.get('https://www.themealdb.com/api/json/v1/1/search.php?s=')
    if response.status_code != 200:
        print("Failed to fetch recipes from TheMealDB")
        return
    
    meals = response.json().get('meals', [])
    if not meals:
        print("No recipes found in TheMealDB response")
        return
    
    # Create a default user for imported recipes if none exists
    default_user = db(db.auth_user).select().first()
    if not default_user:
        default_user_id = db.auth_user.insert(
            username='system',
            email='system@example.com',
            password='system',
            first_name='System',
            last_name='User'
        )
    else:
        default_user_id = default_user.id
    
    imported_count = 0
    for meal in meals:
        try:
            # Map TheMealDB fields to our recipe model
            recipe_name = meal.get('strMeal', '').strip()
            if not recipe_name:
                continue
                
            # Check if recipe already exists
            existing = db(db.recipe.name == recipe_name).select().first()
            if existing:
                print(f"Recipe '{recipe_name}' already exists, skipping...")
                continue
            
            # Download and save image
            image_url = meal.get('strMealThumb')
            image_filename = download_image(image_url, recipe_name) if image_url else None
            
            # Create recipe
            recipe_id = db.recipe.insert(
                name=recipe_name,
                type='Dinner',  # Default type since TheMealDB doesn't provide this
                description=meal.get('strInstructions', '')[:1000],  # Limit to 1000 chars
                instruction_steps=meal.get('strInstructions', ''),
                servings=4,  # Default servings
                author=default_user_id,
                image=image_filename,
                created_on=datetime.utcnow()
            )
            
            # Add ingredients
            for i in range(1, 21):  # TheMealDB has up to 20 ingredients
                ingredient = meal.get(f'strIngredient{i}', '').strip()
                measure = meal.get(f'strMeasure{i}', '').strip()
                
                if ingredient and measure:
                    # Get ingredient image URL
                    ingredient_image_url = get_ingredient_image_url(ingredient)
                    
                    # Create or get ingredient
                    ingredient_record = db(db.ingredient.name == ingredient).select().first()
                    if not ingredient_record:
                        ingredient_record = db.ingredient.insert(
                            name=ingredient,
                            unit='g',  # Default unit
                            description=f"Imported from TheMealDB: {ingredient}",
                            calories_per_unit=0,  # Default values
                            protein_per_unit=0,
                            fat_per_unit=0,
                            carbs_per_unit=0,
                            sugar_per_unit=0,
                            fiber_per_unit=0,
                            sodium_per_unit=0,
                            image=download_image(ingredient_image_url, ingredient, is_ingredient=True)
                        )
                    
                    # Add ingredient to recipe
                    db.recipe_ingredient.insert(
                        recipe_id=recipe_id,
                        ingredient_id=ingredient_record,
                        quantity_per_serving=1  # Default quantity
                    )
            
            imported_count += 1
            print(f"Imported recipe: {recipe_name}")
            
        except Exception as e:
            print(f"Error importing recipe {meal.get('strMeal', 'Unknown')}: {e}")
    
    print(f"\nImport completed. Successfully imported {imported_count} recipes.")

if __name__ == '__main__':
    import_mealdb_recipes() 