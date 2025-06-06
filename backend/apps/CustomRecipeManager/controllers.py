"""
This file defines actions, i.e. functions the URLs are mapped into.

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

---------------------------------------------------------------
Fixture decorators:
@action.uses('generic.html')
@action.uses(session)
@action.uses(db)
@action.uses(T)
@action.uses(auth.user)
@action.uses(auth)
---------------------------------------------------------------
"""

import json
import traceback
from yatl.helpers import A
from py4web import URL, abort, action, redirect, request, response
from .common import (
    T, auth, authenticated, cache, db, flash, logger,
    session, unauthenticated
)
from . import settings
import datetime
import os
import mimetypes
import requests

def set_cors_headers():
    """Set CORS headers based on request origin"""
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Content-Type'] = 'application/json'

def download_themealdb_image(url, recipe_name):
    """Download image from TheMealDB and save to uploads directory"""
    try:
        response = requests.get(url)
        if response.status_code == 200:
            # Create uploads directory if it doesn't exist
            uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            
            # Create filename from recipe name and add timestamp to ensure uniqueness
            timestamp = datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"themealdb_{recipe_name.lower().replace(' ', '_')}_{timestamp}.jpg"
            filepath = os.path.join(uploads_dir, filename)
            
            # Save the image
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            return filename
        else:
            logger.error(f"Failed to download TheMealDB image. Status code: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error downloading TheMealDB image: {e}")
        return None

# ==============================================================
# -------------------- INGREDIENT SEARCH -----------------------
# ==============================================================

@action('api/ingredients/search', method=['GET'])
@action.uses(db)
def ingredients_search():
    """Search ingredients with pagination"""
    set_cors_headers()
    
    query = request.params.get('query', '').strip().lower()

    page  = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 5))

    start, end = (page - 1) * limit, (page * limit)

    ingredients_query = (
        db.ingredient.name.ilike(f"{query}%") if query else db.ingredient
    )
    total_count = db(ingredients_query).count()

    ingredients = db(ingredients_query).select(
        db.ingredient.id,
        db.ingredient.name,
        db.ingredient.unit,
        db.ingredient.description,
        db.ingredient.calories_per_unit,
        db.ingredient.protein_per_unit,
        db.ingredient.fat_per_unit,
        db.ingredient.carbs_per_unit,
        db.ingredient.sugar_per_unit,
        db.ingredient.fiber_per_unit,
        db.ingredient.sodium_per_unit,
        orderby=db.ingredient.name,
        limitby=(start, end)
    ).as_list()

    return dict(
        ingredients=ingredients,
        total=total_count,
        page=page,
        limit=limit
    )

@action('api/ingredients/search', method=['OPTIONS'])
def ingredients_search_options():
    set_cors_headers()
    return ""

# ==============================================================
# ------------------- ADD INGREDIENT ---------------------------
# ==============================================================

@action('api/ingredients', method=['POST'])
@action.uses(db, session, auth.user)
def add_ingredient():
    set_cors_headers()
    
    if not auth.current_user:
        response.status = 401
        return {"error": "Not authenticated"}
    
    try:
        data = request.json or {}
        required_fields = {'name', 'unit', 'description', 'calories_per_unit'}
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            response.status = 400
            return {"error": f"Missing required fields: {', '.join(missing)}"}
        if db(db.ingredient.name.lower() == data['name'].strip().lower()).count():
            response.status = 400
            return {"error": "Ingredient with this name already exists"}
       
        ingredient_id = db.ingredient.insert(
            name=data['name'].strip(),
            unit=data['unit'],
            description=data['description'],
            calories_per_unit=float(data.get('calories_per_unit', 0)),
            protein_per_unit=float(data.get('protein_per_unit', 0)),
            fat_per_unit=float(data.get('fat_per_unit', 0)),
            carbs_per_unit=float(data.get('carbs_per_unit', 0)),
            sugar_per_unit=float(data.get('sugar_per_unit', 0)),
            fiber_per_unit=float(data.get('fiber_per_unit', 0)),
            sodium_per_unit=float(data.get('sodium_per_unit', 0)),
            created_on=datetime.datetime.utcnow(),
            created_by=auth.current_user['id']
        )
        
        ingredient = db.ingredient[ingredient_id]
        response.status = 201
        return {
            "success": True,
            "message": "Ingredient created successfully",
            "ingredient": {
                "id": ingredient.id,
                "name": ingredient.name,
                "unit": ingredient.unit,
                "description": ingredient.description,
                "calories_per_unit": ingredient.calories_per_unit,
                "protein_per_unit": ingredient.protein_per_unit,
                "fat_per_unit": ingredient.fat_per_unit,
                "carbs_per_unit": ingredient.carbs_per_unit,
                "sugar_per_unit": ingredient.sugar_per_unit,
                "fiber_per_unit": ingredient.fiber_per_unit,
                "sodium_per_unit": ingredient.sodium_per_unit
            }
        }
    
    except Exception as e:
        logger.error(f"Ingredient creation error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Failed to create ingredient. Please try again."}

@action('api/ingredients', method=['OPTIONS'])
def ingredients_options():
    set_cors_headers()
    return ""

# ==============================================================
# ------------------- AUTHENTICATION API -----------------------
# ==============================================================

@action('api/auth/register', method=['POST'])
@action.uses(db, session, auth)
def auth_register():
    """Register a new user"""
    set_cors_headers()

    try:
        data = request.json or {}
        required = {'email', 'password', 'first_name'}
        if not required.issubset(data):
            response.status = 400
            return {"error": f"Missing required fields: {', '.join(required)}"}

        if db(db.auth_user.email == data['email']).count():
            response.status = 400
            return {"error": "User with this email already exists"}

        from pydal.validators import CRYPT
        user_id = db.auth_user.insert(
            email=data['email'],
            password=CRYPT()(data['password'])[0],
            first_name=data['first_name'],
            last_name=data.get('last_name', ''),
            username=data['email']
        )

        user = db.auth_user[user_id]
        auth.store_user_in_session(user.id)
        return {
            "success": True,
            "message": "Registration successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            },
            "redirect": "/dashboard"
        }
    except Exception as e:
        logger.error(f"Registration error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Registration failed. Please try again."}

@action('api/auth/login', method=['POST'])
@action.uses(db, session, auth)
def auth_login():
    """Log a user in"""
    set_cors_headers()

    try:
        data = request.json or {}
        print("=== LOGIN DEBUG ===")
        print("Request headers:", dict(request.headers))
        print("Initial session:", dict(session))
        
        if not {'email', 'password'}.issubset(data):
            response.status = 400
            return {"error": "Missing required fields: email, password"}

        print("Attempting to find user:", data['email'])
        user = db(db.auth_user.email == data['email']).select().first()
        print("Found user:", user is not None)
        
        if not user:
            response.status = 401
            return {"error": "Invalid email or password"}

        # Validate password using py4web's built-in methods
        from pydal.validators import CRYPT
        crypt = CRYPT()
        if crypt(data['password'])[0] == user.password:
            # Use auth's session management
            auth.store_user_in_session(user['id'])
            
            print("Login success: True")
            print("User:", user)
            print("Session after login:", dict(session))
            print("Auth current_user:", auth.current_user)
            print("==================")
            
            return {
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name
                },
                "redirect": "/dashboard"
            }
        else:
            response.status = 401
            return {"error": "Invalid email or password"}

    except Exception as e:
        logger.error(f"Login error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Login failed. Please try again."}

@action('api/auth/logout', method=['POST'])
@action.uses(db, session, auth)
def auth_logout():
    """Log a user out"""
    set_cors_headers()
    # Clear all session data
    session.clear()
    auth.clear_session()
    # Clear auth cookies
    response.cookies['py4web_session'] = ''
    response.cookies['py4web_session']['expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'
    response.cookies['py4web_session']['path'] = '/'
    return {"success": True, "message": "Logout successful"}

@action('api/auth/user', method=['GET'])
@action.uses(db, session, auth.user)
def auth_user():
    """Return current user info"""
    set_cors_headers()

    if auth.current_user:
        u = auth.current_user
        return {
            "success": True,
            "user": {
                "id": u['id'],
                "email": u['email'],
                "first_name": u['first_name'],
                "last_name": u['last_name']
            }
        }
    response.status = 401
    return {"error": "Not authenticated"}

# -------- CORS OPTION handlers for auth --------
for _path in ('register', 'login', 'logout', 'user'):
    @action(f'api/auth/{_path}', method=['OPTIONS'])
    def _auth_opts():
        set_cors_headers()
        return ""

# ==============================================================
# ------------------ RECIPE CRUD ENDPOINTS ---------------------
# ==============================================================

@action('api/recipes', method=['POST'])
@action.uses(db, session, auth.user)
def create_recipe():
    set_cors_headers()

    try:
        # Handle both JSON and multipart form data
        if request.headers.get('content-type', '').startswith('multipart/form-data'):
            data = {}
            # Get form fields
            for key in request.forms:
                if key == 'ingredients' or key == 'instruction_steps':
                    try:
                        data[key] = json.loads(request.forms[key])
                    except:
                        data[key] = []
                else:
                    data[key] = request.forms[key]
            
            # Handle multiple image uploads (py4web style)
            if 'images' in request.files:
                image_files = request.files['images']
                # Ensure image_files is always a list
                if not isinstance(image_files, list):
                    image_files = [image_files]
                if image_files:
                    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
                    os.makedirs(uploads_dir, exist_ok=True)
                    data['images'] = []
                    for image_file in image_files:
                        if image_file and hasattr(image_file, 'filename'):
                            filename = f"recipe_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{len(data['images'])}.jpg"
                            image_path = os.path.join(uploads_dir, filename)
                            with open(image_path, 'wb') as f:
                                f.write(image_file.file.read())
                            data['images'].append(filename)
        else:
            data = request.json

        print("Received data:", data)  # Debug print

        required_fields = {'name', 'type', 'description', 'instruction_steps', 'servings'}
        
        if not data or not all(field in data for field in required_fields):
            response.status = 400
            return {"error": f"Missing required fields. Required: {', '.join(required_fields)}"}
            
        # Validate recipe type
        valid_types = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink']
        if data['type'] not in valid_types:
            response.status = 400
            return {"error": f"Invalid recipe type. Must be one of: {', '.join(valid_types)}"}
            
        # Create the recipe
        recipe_id = db.recipe.insert(
            name=data['name'],
            type=data['type'],
            description=data['description'],
            instruction_steps=data['instruction_steps'],
            servings=data['servings'],
            image=data.get('images', [None])[0] if data.get('images') else None,  # Store filename for uploaded images
            author=auth.current_user['id'],
            created_on=datetime.datetime.utcnow()
        )
        
        # Save additional images to recipe_multiple_images table
        if data.get('images'):
            for image_filename in data['images'][1:]:  # Skip first image as it's already saved as main image
                # Insert into database using the filename directly
                db.recipe_multiple_images.insert(
                    recipe_id=recipe_id,
                    multi_images=image_filename
                )
        
        # Save ingredients to recipe_ingredient table
        ingredients = data.get('ingredients', [])
        for ing in ingredients:
            db.recipe_ingredient.insert(
                recipe_id=recipe_id,
                ingredient_id=ing['id'],
                quantity_per_serving=ing.get('quantity_per_serving', 1)
            )
        
        # Get the created recipe with all images
        recipe = db.recipe[recipe_id]
        recipe_images = db(db.recipe_multiple_images.recipe_id == recipe_id).select()
        
        return {
            "success": True,
            "message": "Recipe created successfully",
            "recipe": {
                "id": recipe.id,
                "name": recipe.name,
                "type": recipe.type,
                "description": recipe.description,
                "instruction_steps": recipe.instruction_steps,
                "servings": recipe.servings,
                "image": recipe.image,
                "images": [img.multi_images for img in recipe_images],
                "author": recipe.author
            }
        }
        
    except Exception as e:
        logger.error(f"Recipe creation error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Failed to create recipe. Please try again."}

@action('api/recipes', method=['GET'])
@action.uses(db, session, auth.user)
def get_recipes():
    """Return recipes authored by current user"""
    set_cors_headers()

    try:
        # Get recipes with author details
        recipes = db(db.recipe.author == auth.current_user['id']).select(
            db.recipe.ALL,
            db.auth_user.first_name,
            db.auth_user.last_name,
            left=db.auth_user.on(db.recipe.author == db.auth_user.id),
            orderby=~db.recipe.created_on
        ).as_list()

        # Format the recipes
        formatted_recipes = []
        for recipe in recipes:
            # Get additional images for this recipe
            recipe_images = db(db.recipe_multiple_images.recipe_id == recipe['recipe']['id']).select()
            all_images = []
            if recipe['recipe']['image']:
                all_images.append(recipe['recipe']['image'])
            all_images.extend([img.multi_images for img in recipe_images if img.multi_images])

            # Calculate nutrition for this recipe
            total_nutrition = {
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fat': 0
            }
            recipe_ingredients = db(db.recipe_ingredient.recipe_id == recipe['recipe']['id']).select(
                db.recipe_ingredient.ALL,
                db.ingredient.ALL,
                left=db.ingredient.on(db.recipe_ingredient.ingredient_id == db.ingredient.id)
            )
            for ri in recipe_ingredients:
                if ri.ingredient.id:
                    qty = ri.recipe_ingredient.quantity_per_serving or 0
                    total_nutrition['calories'] += (ri.ingredient.calories_per_unit or 0) * qty
                    total_nutrition['protein']  += (ri.ingredient.protein_per_unit or 0) * qty
                    total_nutrition['carbs']    += (ri.ingredient.carbs_per_unit or 0) * qty
                    total_nutrition['fat']      += (ri.ingredient.fat_per_unit or 0) * qty
            servings = recipe['recipe']['servings'] or 1
            nutrition_per_serving = {k: round(v / servings, 2) for k, v in total_nutrition.items()}
            # Add both per serving and total fields for the frontend cards
            formatted_recipe = {
                'id': recipe['recipe']['id'],
                'name': recipe['recipe']['name'],
                'type': recipe['recipe']['type'],
                'description': recipe['recipe']['description'],
                'instruction_steps': recipe['recipe']['instruction_steps'],
                'servings': recipe['recipe']['servings'],
                'image': recipe['recipe']['image'],
                'images': all_images,  # Include all images
                'created_on': recipe['recipe']['created_on'],
                'author': recipe['recipe']['author'],
                'author_name': f"{recipe['auth_user']['first_name']} {recipe['auth_user']['last_name']}",
                'nutrition_per_serving': nutrition_per_serving,
                'total_calories': total_nutrition['calories'],
                'total_protein': total_nutrition['protein'],
                'total_carbs': total_nutrition['carbs'],
                'total_fat': total_nutrition['fat']
            }
            formatted_recipes.append(formatted_recipe)

        return {"success": True, "recipes": formatted_recipes}
    except Exception as e:
        logger.error(f"Get recipes error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Failed to get recipes"}


@action('api/recipes', method=['OPTIONS'])
def recipes_options():
    set_cors_headers()
    return ""

@action('api/recipes/public', method=['GET'])
@action.uses(db, session)
def get_public_recipes():
    """Return all public recipes"""
    set_cors_headers()

    try:
        # Get all recipes with author details
        recipes = db().select(
            db.recipe.ALL,
            db.auth_user.first_name,
            db.auth_user.last_name,
            left=db.auth_user.on(db.recipe.author == db.auth_user.id),
            orderby=~db.recipe.created_on
        ).as_list()

        # Format the recipes
        formatted_recipes = []
        for recipe in recipes:
            # Get additional images for this recipe
            recipe_images = db(db.recipe_multiple_images.recipe_id == recipe['recipe']['id']).select()
            all_images = []
            if recipe['recipe']['image']:
                all_images.append(recipe['recipe']['image'])
            all_images.extend([img.multi_images for img in recipe_images if img.multi_images])

            # Calculate nutrition for this recipe
            total_nutrition = {
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fat': 0
            }
            recipe_ingredients = db(db.recipe_ingredient.recipe_id == recipe['recipe']['id']).select(
                db.recipe_ingredient.ALL,
                db.ingredient.ALL,
                left=db.ingredient.on(db.recipe_ingredient.ingredient_id == db.ingredient.id)
            )
            for ri in recipe_ingredients:
                if ri.ingredient.id:
                    qty = ri.recipe_ingredient.quantity_per_serving or 0
                    total_nutrition['calories'] += (ri.ingredient.calories_per_unit or 0) * qty
                    total_nutrition['protein']  += (ri.ingredient.protein_per_unit or 0) * qty
                    total_nutrition['carbs']    += (ri.ingredient.carbs_per_unit or 0) * qty
                    total_nutrition['fat']      += (ri.ingredient.fat_per_unit or 0) * qty
            servings = recipe['recipe']['servings'] or 1
            nutrition_per_serving = {k: round(v / servings, 2) for k, v in total_nutrition.items()}
            # Add both per serving and total fields for the frontend cards
            formatted_recipe = {
                'id': recipe['recipe']['id'],
                'name': recipe['recipe']['name'],
                'type': recipe['recipe']['type'],
                'description': recipe['recipe']['description'],
                'instruction_steps': recipe['recipe']['instruction_steps'],
                'servings': recipe['recipe']['servings'],
                'image': recipe['recipe']['image'],
                'images': all_images,  # Include all images
                'created_on': recipe['recipe']['created_on'],
                'author': recipe['recipe']['author'],
                'author_name': f"{recipe['auth_user']['first_name']} {recipe['auth_user']['last_name']}",
                'nutrition_per_serving': nutrition_per_serving,
                'total_calories': total_nutrition['calories'],
                'total_protein': total_nutrition['protein'],
                'total_carbs': total_nutrition['carbs'],
                'total_fat': total_nutrition['fat']
            }
            formatted_recipes.append(formatted_recipe)

        return {"success": True, "recipes": formatted_recipes}
    except Exception as e:
        logger.error(f"Get public recipes error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Failed to get public recipes"}

@action('api/recipes/public', method=['OPTIONS'])
def public_recipes_options():
    set_cors_headers()
    return ""

@action('api/recipes/<recipe_id>', method=['GET'])
@action.uses(db, session)
def get_recipe_detail(recipe_id):
    """Get detailed recipe information by ID"""
    set_cors_headers()
    
    try:
        # Get the recipe with author details
        recipe_query = db(db.recipe.id == recipe_id).select(
            db.recipe.ALL,
            db.auth_user.first_name,
            db.auth_user.last_name,
            left=db.auth_user.on(db.recipe.author == db.auth_user.id)
        ).first()
        
        if not recipe_query:
            response.status = 404
            return {"error": "Recipe not found"}
        
        # Get recipe ingredients
        ingredients = db(db.recipe_ingredient.recipe_id == recipe_id).select(
            db.recipe_ingredient.ALL,
            db.ingredient.ALL,
            left=db.ingredient.on(db.recipe_ingredient.ingredient_id == db.ingredient.id)
        ).as_list()
        
        # Get recipe images
        images = db(db.recipe_multiple_images.recipe_id == recipe_id).select().as_list()
        
        # Format the recipe
        formatted_recipe = {
            'id': recipe_query['recipe']['id'],
            'name': recipe_query['recipe']['name'],
            'type': recipe_query['recipe']['type'],
            'description': recipe_query['recipe']['description'],
            'instruction_steps': recipe_query['recipe']['instruction_steps'],
            'servings': recipe_query['recipe']['servings'],
            'image': recipe_query['recipe']['image'],
            'created_on': recipe_query['recipe']['created_on'],
            'author': recipe_query['recipe']['author'],
            'author_name': f"{recipe_query['auth_user']['first_name']} {recipe_query['auth_user']['last_name']}" if recipe_query['auth_user'] else 'Unknown Chef',
            'ingredients': [],
            'images': [img['multi_images'] for img in images] if images else []
        }
        
        # Initialize nutrition totals
        total_nutrition = {
            'calories': 0,
            'protein': 0,
            'fat': 0,
            'carbs': 0,
            'sugar': 0,
            'fiber': 0,
            'sodium': 0
        }
        
        # Format ingredients and sum nutrition
        formatted_recipe['ingredients'] = []
        for ingredient in ingredients:
            ing = ingredient['ingredient']
            qty = ingredient['recipe_ingredient']['quantity_per_serving']
            ingredient_data = {
                'id': ing['id'],
                'name': ing['name'],
                'unit': ing['unit'],
                'quantity_per_serving': qty,
                'calories_per_unit': ing['calories_per_unit'] or 0,
                'protein_per_unit': ing['protein_per_unit'] or 0,
                'fat_per_unit': ing['fat_per_unit'] or 0,
                'carbs_per_unit': ing['carbs_per_unit'] or 0,
                'sugar_per_unit': ing['sugar_per_unit'] or 0,
                'fiber_per_unit': ing['fiber_per_unit'] or 0,
                'sodium_per_unit': ing['sodium_per_unit'] or 0,
            }
            # Calculate total for this ingredient
            ingredient_data['calories'] = ingredient_data['calories_per_unit'] * qty
            ingredient_data['protein'] = ingredient_data['protein_per_unit'] * qty
            ingredient_data['fat'] = ingredient_data['fat_per_unit'] * qty
            ingredient_data['carbs'] = ingredient_data['carbs_per_unit'] * qty
            ingredient_data['sugar'] = ingredient_data['sugar_per_unit'] * qty
            ingredient_data['fiber'] = ingredient_data['fiber_per_unit'] * qty
            ingredient_data['sodium'] = ingredient_data['sodium_per_unit'] * qty
            # Add to totals
            total_nutrition['calories'] += ingredient_data['calories']
            total_nutrition['protein']  += ingredient_data['protein']
            total_nutrition['fat']      += ingredient_data['fat']
            total_nutrition['carbs']    += ingredient_data['carbs']
            total_nutrition['sugar']    += ingredient_data['sugar']
            total_nutrition['fiber']    += ingredient_data['fiber']
            total_nutrition['sodium']   += ingredient_data['sodium']
            formatted_recipe['ingredients'].append(ingredient_data)
        
        # Add total and per-serving nutrition to recipe
        servings = formatted_recipe['servings'] or 1
        formatted_recipe['total_nutrition'] = {k: round(v, 2) for k, v in total_nutrition.items()}
        formatted_recipe['nutrition_per_serving'] = {k: round(v / servings, 2) for k, v in total_nutrition.items()}
        
        return {"success": True, "recipe": formatted_recipe}
        
    except Exception as e:
        logger.error(f"Get recipe detail error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Failed to get recipe details"}

@action('api/recipes/<recipe_id>', method=['OPTIONS'])
def recipe_detail_options(recipe_id):
    set_cors_headers()
    return ""

# ==============================================================
# ------------------- CONTACT FORM ENDPOINT --------------------
# ==============================================================

@action('api/contact', method=['POST'])
@action.uses(db)
def submit_contact():
    """Contact-us form"""
    set_cors_headers()

    try:
        data = request.json or {}
        required = {'name', 'email', 'subject', 'message'}
        if not required.issubset(data):
            response.status = 400
            return {"error": "Missing required fields: name, email, subject, message"}

        contact_id = db.contact.insert(**data)

        # Optional: email notification
        try:
            if auth.sender and getattr(settings, 'CONTACT_NOTIFICATION_EMAIL', None):
                auth.sender.send(
                    to=[settings.CONTACT_NOTIFICATION_EMAIL],
                    subject=f"New Contact Submission: {data['subject']}",
                    body=f"From: {data['name']} <{data['email']}>\n\n{data['message']}"
                )
                auth.sender.send(
                    to=[data['email']],
                    subject="Thank you for contacting Mealzi!",
                    body=(
                        f"Hi {data['name']},\n\n"
                        f"Thanks for reaching out about \"{data['subject']}\". "
                        "We'll get back to you within 24 hours.\n\n"
                        "— Mealzi Team"
                    )
                )
        except Exception as mail_err:
            logger.error(f"Email error: {mail_err}")

        return {
            "success": True,
            "message": "Your message has been sent successfully!",
            "id": contact_id
        }
    except Exception as e:
        logger.error(f"Contact error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "An unexpected error occurred. Please try again later."}

@action('api/contact', method=['OPTIONS'])
def contact_options():

    set_cors_headers()
    return ""

    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

@action('api/recipes/<recipe_id>/upload_images', method=['POST'])
@action.uses(db, auth.user)

def upload_images(recipe_id):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'


    try:
        # get the upload files from the request
        files = request.files.getlist('upload_images')
        if not files:
            return dict(success=False, error="No files uploaded")

        # check how many images exist for the recipe
        existing_count = db(db.recipe_multiple_images.recipe_id == recipe_id).count()
        available_slots = 5 - existing_count

        if available_slots <= 0:
            return dict(success=False, error="Maximum of 5 images per recipe reached")

        # accept only the number of files that fit within the limit
        files_to_upload = files[:available_slots]
        uploaded = 0

        for f in files_to_upload:
            db.recipe_multiple_images.insert(
                recipe_id=recipe_id,
                multi_images=f
            )
            uploaded += 1


        return dict(success=True, uploaded=uploaded, remaining=5 - (existing_count + uploaded))

    except Exception as e:
        return dict(success=False, error=str(e))

# ==============================================================
# ------------------ THEMEALDB IMPORT ENDPOINT ----------------
# ==============================================================

@action('api/admin/import-themealdb', method=['POST'])
@action.uses(db, session, auth.user)
def import_themealdb():
    """
    Admin-only endpoint to import recipes from TheMealDB API
    This should only be run once to populate the database
    """
    set_cors_headers()
    
    # Check if user is admin (you can modify this check based on your admin logic)
    if not auth.current_user or auth.current_user.get('email') != 'admin@example.com':
        response.status = 403
        return {"error": "Admin access required"}
    
    try:
        import requests
        import json
        import time
        from datetime import datetime
        
        # Check if import has already been done
        existing_recipes = db(db.recipe.description.like('%TheMealDB%')).count()
        if existing_recipes > 0:
            return {
                "success": False, 
                "message": f"Import already completed. Found {existing_recipes} TheMealDB recipes in database.",
                "recipes_imported": 0,
                "ingredients_imported": 0
            }
        
        recipes_imported = 0
        ingredients_imported = 0
        errors = []
        
        # TheMealDB API endpoints
        THEMEALDB_BASE = "https://www.themealdb.com/api/json/v1/1"
        
        # First, import ingredients from TheMealDB
        print("Fetching ingredients from TheMealDB...")
        try:
            ingredients_response = requests.get(f"{THEMEALDB_BASE}/list.php?i=list", timeout=10)
            if ingredients_response.status_code == 200:
                ingredients_data = ingredients_response.json()
                
                for ingredient_item in ingredients_data.get('meals', [])[:50]:  # Limit to 50 ingredients
                    ingredient_name = ingredient_item.get('strIngredient')
                    if ingredient_name and ingredient_name.strip():
                        # Check if ingredient already exists
                        existing = db(db.ingredient.name.ilike(ingredient_name.strip())).select().first()
                        if not existing:
                            # Create new ingredient with default values
                            db.ingredient.insert(
                                name=ingredient_name.strip(),
                                unit='g',  # Default unit
                                description=f'Ingredient imported from TheMealDB',
                                calories_per_unit=50,  # Default calories
                                protein_per_unit=2,    # Default protein
                                fat_per_unit=1,       # Default fat
                                carbs_per_unit=10,    # Default carbs
                                sugar_per_unit=2,     # Default sugar
                                fiber_per_unit=1,     # Default fiber
                                sodium_per_unit=5     # Default sodium
                            )
                            ingredients_imported += 1
                            
                    time.sleep(0.1)  # Rate limiting
                    
        except Exception as e:
            errors.append(f"Error importing ingredients: {str(e)}")
        
        # Get categories to fetch recipes from different categories
        categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian']
        
        for category in categories:
            try:
                print(f"Fetching {category} recipes...")
                category_response = requests.get(f"{THEMEALDB_BASE}/filter.php?c={category}", timeout=10)
                
                if category_response.status_code == 200:
                    category_data = category_response.json()
                    meals = category_data.get('meals', [])[:5]  # Limit to 5 recipes per category
                    
                    for meal in meals:
                        meal_id = meal.get('idMeal')
                        if meal_id:
                            try:
                                # Get detailed recipe information
                                detail_response = requests.get(f"{THEMEALDB_BASE}/lookup.php?i={meal_id}", timeout=10)
                                if detail_response.status_code == 200:
                                    detail_data = detail_response.json()
                                    recipe_detail = detail_data.get('meals', [{}])[0]
                                    
                                    if recipe_detail:
                                        # Extract recipe data
                                        recipe_name = recipe_detail.get('strMeal', '').strip()
                                        recipe_category = recipe_detail.get('strCategory', 'Dinner')
                                        recipe_instructions = recipe_detail.get('strInstructions', '').strip()
                                        recipe_image_url = recipe_detail.get('strMealThumb', '')
                                        
                                        # Download and save the image
                                        image_filename = download_themealdb_image(recipe_image_url, recipe_name) if recipe_image_url else None
                                        
                                        # Map TheMealDB categories to our categories
                                        category_mapping = {
                                            'Beef': 'Dinner',
                                            'Chicken': 'Dinner', 
                                            'Dessert': 'Dessert',
                                            'Lamb': 'Dinner',
                                            'Pasta': 'Dinner',
                                            'Pork': 'Dinner',
                                            'Seafood': 'Dinner',
                                            'Vegetarian': 'Lunch',
                                            'Breakfast': 'Breakfast'
                                        }
                                        
                                        mapped_category = category_mapping.get(recipe_category, 'Dinner')
                                        
                                        if recipe_name and recipe_instructions:
                                            # Check if recipe already exists
                                            existing_recipe = db(db.recipe.name.ilike(recipe_name)).select().first()
                                            if not existing_recipe:
                                                # Create admin user if doesn't exist
                                                admin_user = db(db.auth_user.email == 'admin@themealdb.com').select().first()
                                                if not admin_user:
                                                    admin_user_id = db.auth_user.insert(
                                                        first_name='TheMealDB',
                                                        last_name='Admin',
                                                        email='admin@themealdb.com',
                                                        password='dummy_password'
                                                    )
                                                else:
                                                    admin_user_id = admin_user.id
                                                
                                                # Create the recipe
                                                recipe_id = db.recipe.insert(
                                                    name=recipe_name,
                                                    type=mapped_category,
                                                    description=f"Delicious {recipe_name} recipe imported from TheMealDB. {recipe_category} cuisine.",
                                                    instruction_steps=recipe_instructions,
                                                    servings=4,  # Default servings
                                                    image=image_filename,  # Store local filename instead of URL
                                                    author=admin_user_id,
                                                    created_on=datetime.datetime.utcnow()
                                                )
                                                
                                                # Extract and add ingredients
                                                for i in range(1, 21):  # TheMealDB has up to 20 ingredients
                                                    ingredient_name = recipe_detail.get(f'strIngredient{i}', '').strip()
                                                    ingredient_measure = recipe_detail.get(f'strMeasure{i}', '').strip()
                                                    
                                                    if ingredient_name and ingredient_measure:
                                                        # Find or create ingredient
                                                        ingredient = db(db.ingredient.name.ilike(ingredient_name)).select().first()
                                                        if not ingredient:
                                                            ingredient_id = db.ingredient.insert(
                                                                name=ingredient_name,
                                                                unit='g',
                                                                description=f'Ingredient from TheMealDB recipe: {recipe_name}',
                                                                calories_per_unit=50,
                                                                protein_per_unit=2,
                                                                fat_per_unit=1,
                                                                carbs_per_unit=10,
                                                                sugar_per_unit=2,
                                                                fiber_per_unit=1,
                                                                sodium_per_unit=5
                                                            )
                                                            ingredients_imported += 1
                                                        else:
                                                            ingredient_id = ingredient.id
                                                        
                                                        # Parse quantity (simple parsing)
                                                        quantity = 1.0
                                                        try:
                                                            # Extract numbers from measure string
                                                            import re
                                                            numbers = re.findall(r'\d+\.?\d*', ingredient_measure)
                                                            if numbers:
                                                                quantity = float(numbers[0])
                                                        except:
                                                            quantity = 1.0
                                                        
                                                        # Add ingredient to recipe
                                                        db.recipe_ingredient.insert(
                                                            recipe_id=recipe_id,
                                                            ingredient_id=ingredient_id,
                                                            quantity_per_serving=quantity
                                                        )
                                                
                                                recipes_imported += 1
                                                print(f"Imported recipe: {recipe_name}")
                                                
                                time.sleep(0.5)  # Rate limiting between detailed requests
                                
                            except Exception as e:
                                errors.append(f"Error importing recipe {meal_id}: {str(e)}")
                                continue
                                
                time.sleep(1)  # Rate limiting between categories
                
            except Exception as e:
                errors.append(f"Error fetching {category} recipes: {str(e)}")
                continue
        
        # Commit all changes
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully imported {recipes_imported} recipes and {ingredients_imported} ingredients from TheMealDB",
            "recipes_imported": recipes_imported,
            "ingredients_imported": ingredients_imported,
            "errors": errors[:10]  # Limit errors shown
        }
        
    except Exception as e:
        logger.error(f"TheMealDB import error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": f"Import failed: {str(e)}"}

@action('api/admin/import-themealdb', method=['OPTIONS'])
def import_themealdb_options():
    set_cors_headers()
    return ""

@action('uploads/<filename>')
def serve_upload(filename):
    """Serve uploaded files from the local uploads directory"""
    uploads_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    file_path = os.path.join(uploads_folder, filename)
    if not os.path.isfile(file_path):
        response.status = 404
        return "File not found"
    import mimetypes
    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = 'application/octet-stream'
    response.headers['Content-Type'] = content_type
    with open(file_path, 'rb') as f:
        return f.read()

# ==============================================================
# ------------------ RECIPE SEARCH ----------------------------
# ==============================================================

@action('api/recipes/search', method=['GET'])
@action.uses(db, session)
def search_recipes():
    """Search recipes by name and/or type with pagination"""
    set_cors_headers()
    
    # Get search parameters from request
    name_query = request.params.get('name', '').strip()
    type_query = request.params.get('type', '').strip()
    
    # Pagination parameters
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    start, end = (page - 1) * limit, (page * limit)
    
    # Build query based on search parameters
    query = db.recipe
    if name_query:
        query = db.recipe.name.ilike(f'%{name_query}%')
    if type_query:
        if name_query:
            query = query & (db.recipe.type == type_query)
        else:
            query = db.recipe.type == type_query
    
    # Count total recipes matching the query
    total_count = db(query).count()
    
    # Get recipes with author information
    recipes = db(query).select(
        db.recipe.ALL,
        db.auth_user.first_name,
        db.auth_user.last_name,
        left=db.auth_user.on(db.recipe.author == db.auth_user.id),
        orderby=~db.recipe.created_on,
        limitby=(start, end)
    )
    
    # Process recipes for response
    result = []
    for recipe in recipes:
        author_name = f"{recipe.auth_user.first_name} {recipe.auth_user.last_name}".strip()
        
        # Get total nutritional values
        total_calories = 0
        total_protein = 0
        total_fat = 0
        total_carbs = 0
        
        # Get recipe ingredients with nutritional info
        recipe_ingredients = db(db.recipe_ingredient.recipe_id == recipe.recipe.id).select(
            db.recipe_ingredient.ALL,
            db.ingredient.ALL,
            left=db.ingredient.on(db.recipe_ingredient.ingredient_id == db.ingredient.id)
        )
        
        # Calculate total nutritional values
        for ri in recipe_ingredients:
            if ri.ingredient.id:
                quantity = ri.recipe_ingredient.quantity_per_serving
                total_calories += quantity * ri.ingredient.calories_per_unit
                total_protein += quantity * ri.ingredient.protein_per_unit
                total_fat += quantity * ri.ingredient.fat_per_unit
                total_carbs += quantity * ri.ingredient.carbs_per_unit
        
        # Format the recipe for response
        result.append({
            "id": recipe.recipe.id,
            "name": recipe.recipe.name,
            "type": recipe.recipe.type,
            "description": recipe.recipe.description,
            "image": recipe.recipe.image,
            "author": recipe.recipe.author,
            "author_name": author_name,
            "servings": recipe.recipe.servings,
            "created_on": recipe.recipe.created_on,
            "total_calories": round(total_calories, 2),
            "total_protein": round(total_protein, 2),
            "total_fat": round(total_fat, 2),
            "total_carbs": round(total_carbs, 2)
        })
    
    return {
        "success": True,
        "total": total_count,
        "page": page,
        "limit": limit,
        "recipes": result
    }

@action('api/recipes/search', method=['OPTIONS'])
def search_recipes_options():
    set_cors_headers()
    return ""

@action('api/recipes/search_by_ingredients', method=['GET'])
@action.uses(db, session)
def search_recipes_by_ingredients():
    """Search recipes containing a subset of provided ingredients"""
    set_cors_headers()
    
    # Get ingredients from query parameters (comma-separated list of IDs)
    ingredient_ids = request.params.get('ingredients', '').strip()
    match_all = request.params.get('match_all', 'false').lower() == 'true'
    
    # Optional name and type filters
    name_query = request.params.get('name', '').strip()
    type_query = request.params.get('type', '').strip()
    
    # Parse ingredient IDs
    if ingredient_ids:
        try:
            ingredient_ids = [int(id) for id in ingredient_ids.split(',')]
        except ValueError:
            response.status = 400
            return {"error": "Invalid ingredient IDs format"}
    else:
        ingredient_ids = []
    
    # Pagination parameters
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    start, end = (page - 1) * limit, (page * limit)
    
    if not ingredient_ids:
        # If no ingredients provided, return empty results
        return {
            "success": True,
            "total": 0,
            "page": page,
            "limit": limit,
            "recipes": []
        }
    
    # Construct the query
    if match_all:
        # Find recipes that contain ALL of the specified ingredients
        # For each ingredient, find recipes that contain it, then intersect the sets
        recipe_ids = None
        for ingredient_id in ingredient_ids:
            recipes_with_ingredient = db(db.recipe_ingredient.ingredient_id == ingredient_id).select(
                db.recipe_ingredient.recipe_id
            )
            ingredient_recipe_ids = {r.recipe_id for r in recipes_with_ingredient}
            
            if recipe_ids is None:
                recipe_ids = ingredient_recipe_ids
            else:
                recipe_ids &= ingredient_recipe_ids  # Set intersection
        
        if not recipe_ids:
            return {
                "success": True,
                "total": 0,
                "page": page,
                "limit": limit,
                "recipes": []
            }
        
        # Base query for recipes with all ingredients
        query = db.recipe.id.belongs(recipe_ids)
    else:
        # Find recipes that contain ANY of the specified ingredients
        recipe_ids = db(db.recipe_ingredient.ingredient_id.belongs(ingredient_ids)).select(
            db.recipe_ingredient.recipe_id, distinct=True
        )
        recipe_ids = [r.recipe_id for r in recipe_ids]
        
        if not recipe_ids:
            return {
                "success": True,
                "total": 0,
                "page": page,
                "limit": limit,
                "recipes": []
            }
        
        # Base query for recipes with any of the ingredients
        query = db.recipe.id.belongs(recipe_ids)
    
    # Apply additional filters
    if name_query:
        query = query & db.recipe.name.ilike(f'%{name_query}%')
    if type_query:
        query = query & (db.recipe.type == type_query)
    
    # Count total recipes matching the query
    total_count = db(query).count()
    
    # Get recipes with author information
    recipes = db(query).select(
        db.recipe.ALL,
        db.auth_user.first_name,
        db.auth_user.last_name,
        left=db.auth_user.on(db.recipe.author == db.auth_user.id),
        orderby=~db.recipe.created_on,
        limitby=(start, end)
    )
    
    # Process recipes for response
    result = []
    for recipe in recipes:
        author_name = f"{recipe.auth_user.first_name} {recipe.auth_user.last_name}".strip()
        
        # Get total nutritional values
        total_calories = 0
        total_protein = 0
        total_fat = 0
        total_carbs = 0
        
        # Get recipe ingredients with nutritional info
        recipe_ingredients = db(db.recipe_ingredient.recipe_id == recipe.recipe.id).select(
            db.recipe_ingredient.ALL,
            db.ingredient.ALL,
            left=db.ingredient.on(db.recipe_ingredient.ingredient_id == db.ingredient.id)
        )
        
        # Calculate which requested ingredients are in this recipe
        recipe_ingredient_ids = [ri.ingredient.id for ri in recipe_ingredients if ri.ingredient.id]
        matching_ingredients = [id for id in ingredient_ids if id in recipe_ingredient_ids]
        
        # Calculate total nutritional values
        for ri in recipe_ingredients:
            if ri.ingredient.id:
                quantity = ri.recipe_ingredient.quantity_per_serving
                total_calories += quantity * ri.ingredient.calories_per_unit
                total_protein += quantity * ri.ingredient.protein_per_unit
                total_fat += quantity * ri.ingredient.fat_per_unit
                total_carbs += quantity * ri.ingredient.carbs_per_unit
        
        # Format the recipe for response
        result.append({
            "id": recipe.recipe.id,
            "name": recipe.recipe.name,
            "type": recipe.recipe.type,
            "description": recipe.recipe.description,
            "image": recipe.recipe.image,
            "author": recipe.recipe.author,
            "author_name": author_name,
            "servings": recipe.recipe.servings,
            "created_on": recipe.recipe.created_on,
            "total_calories": round(total_calories, 2),
            "total_protein": round(total_protein, 2),
            "total_fat": round(total_fat, 2),
            "total_carbs": round(total_carbs, 2),
            "matching_ingredients": len(matching_ingredients),
            "total_requested_ingredients": len(ingredient_ids)
        })
    
    return {
        "success": True,
        "total": total_count,
        "page": page,
        "limit": limit,
        "recipes": result
    }

@action('api/recipes/search_by_ingredients', method=['OPTIONS'])
def search_recipes_by_ingredients_options():
    set_cors_headers()
    return ""

@action('api/recipes/<recipe_id>', method=['PUT', 'PATCH'])
@action.uses(db, session, auth.user)
def update_recipe(recipe_id):
    set_cors_headers()
    if not auth.current_user:
        response.status = 401
        return {"error": "Not authenticated"}
    recipe = db.recipe[recipe_id]
    if not recipe:
        response.status = 404
        return {"error": "Recipe not found"}
    if recipe.author != auth.current_user['id']:
        response.status = 403
        return {"error": "You are not the author of this recipe"}

    # Support both JSON and multipart/form-data
    if request.headers.get('content-type', '').startswith('multipart/form-data'):
        data = {}
        for key in request.forms:
            if key in ['ingredients', 'instruction_steps', 'existing_images']:
                try:
                    data[key] = json.loads(request.forms[key])
                except:
                    data[key] = []
            else:
                data[key] = request.forms[key]
        # Handle new image uploads
        new_image_files = request.files.get('images', [])
        if not isinstance(new_image_files, list):
            new_image_files = [new_image_files] if new_image_files else []
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        new_filenames = []
        for image_file in new_image_files:
            if image_file and hasattr(image_file, 'filename'):
                filename = f"recipe_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{image_file.filename}"
                image_path = os.path.join(uploads_dir, filename)
                with open(image_path, 'wb') as f:
                    f.write(image_file.file.read())
                new_filenames.append(filename)
        # Images to keep
        existing_images = data.get('existing_images', [])
        # Remove images not in existing_images
        all_db_images = [recipe.image] if recipe.image else []
        all_db_images += [img.multi_images for img in db(db.recipe_multiple_images.recipe_id == recipe_id).select()]
        to_remove = [img for img in all_db_images if img not in existing_images]
        for img in to_remove:
            # Remove from DB and filesystem
            db(db.recipe_multiple_images.recipe_id == recipe_id and db.recipe_multiple_images.multi_images == img).delete()
            if recipe.image == img:
                db.recipe[recipe_id] = dict(image=None)
            img_path = os.path.join(uploads_dir, img)
            if os.path.exists(img_path):
                try:
                    os.remove(img_path)
                except Exception:
                    pass
        # Add new images to DB
        all_images = existing_images + new_filenames
        # First image is main image
        db.recipe[recipe_id] = dict(image=all_images[0] if all_images else None)
        # Remove all old additional images, re-add those in all_images[1:]
        db(db.recipe_multiple_images.recipe_id == recipe_id).delete()
        for img in all_images[1:]:
            db.recipe_multiple_images.insert(recipe_id=recipe_id, multi_images=img)
        # Update other fields
        updatable_fields = ['name', 'type', 'description', 'instruction_steps', 'servings']
        update_dict = {field: data[field] for field in updatable_fields if field in data}
        if update_dict:
            db.recipe[recipe_id] = update_dict
        # Update ingredients if provided
        if 'ingredients' in data:
            db(db.recipe_ingredient.recipe_id == recipe_id).delete()
            for ing in data['ingredients']:
                db.recipe_ingredient.insert(
                    recipe_id=recipe_id,
                    ingredient_id=ing['id'],
                    quantity_per_serving=ing.get('quantity_per_serving', 1)
                )
        return {"success": True, "message": "Recipe updated successfully"}
    else:
        # Fallback to JSON (no image update)
        data = request.json or {}
        updatable_fields = ['name', 'type', 'description', 'instruction_steps', 'servings']
        for field in updatable_fields:
            if field in data:
                recipe[field] = data[field]
        db.recipe[recipe_id] = recipe
        if 'ingredients' in data:
            db(db.recipe_ingredient.recipe_id == recipe_id).delete()
            for ing in data['ingredients']:
                db.recipe_ingredient.insert(
                    recipe_id=recipe_id,
                    ingredient_id=ing['id'],
                    quantity_per_serving=ing.get('quantity_per_serving', 1)
                )
        return {"success": True, "message": "Recipe updated successfully"}

@action('api/recipes/<recipe_id>', method=['DELETE'])
@action.uses(db, session, auth.user)
def delete_recipe(recipe_id):
    set_cors_headers()
    if not auth.current_user:
        response.status = 401
        return {"error": "Not authenticated"}
    recipe = db.recipe[recipe_id]
    if not recipe:
        response.status = 404
        return {"error": "Recipe not found"}
    if recipe.author != auth.current_user['id']:
        response.status = 403
        return {"error": "You are not the author of this recipe"}
    # Delete related ingredients and images
    db(db.recipe_ingredient.recipe_id == recipe_id).delete()
    db(db.recipe_multiple_images.recipe_id == recipe_id).delete()
    db(db.recipe.id == recipe_id).delete()
    return {"success": True, "message": "Recipe deleted successfully"}

# Root redirect to static path (as requested by user)
@action('index')
@action('/')
def root_redirect():
    """Redirect root path to the static React app"""
    redirect('/CustomRecipeManager/static/')

# Handle static directory root to serve index.html
@action('static/')
def serve_static_root():
    """Serve index.html when accessing the static directory root"""
    static_folder = os.path.join(os.path.dirname(__file__), 'static')
    index_html_path = os.path.join(static_folder, 'index.html')
    
    logger.info("Serving React SPA index.html for static root")
    
    if os.path.isfile(index_html_path):
        response.headers['Content-Type'] = 'text/html'
        try:
            with open(index_html_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error serving index.html: {str(e)}")
            response.status = 500
            return "Error serving frontend"
    else:
        response.status = 404
        return "Frontend not found"

# Redirect clean URLs to the React app
@action('static/recipe/<recipe_id:int>')
def serve_recipe_spa(recipe_id):
    """Serve React app for recipe URLs"""
    static_folder = os.path.join(os.path.dirname(__file__), 'static')
    index_html_path = os.path.join(static_folder, 'index.html')
    
    logger.info(f"Serving React SPA for recipe route: {recipe_id}")
    
    if os.path.isfile(index_html_path):
        response.headers['Content-Type'] = 'text/html'
        try:
            with open(index_html_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error serving index.html: {str(e)}")
            response.status = 500
            return "Error serving frontend"
    else:
        response.status = 404
        return "Frontend not found"

@action('static/recipes')
def serve_recipes_spa():
    """Serve React app for recipes page"""
    static_folder = os.path.join(os.path.dirname(__file__), 'static')
    index_html_path = os.path.join(static_folder, 'index.html')
    
    logger.info("Serving React SPA for recipes page")
    
    if os.path.isfile(index_html_path):
        response.headers['Content-Type'] = 'text/html'
        try:
            with open(index_html_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error serving index.html: {str(e)}")
            response.status = 500
            return "Error serving frontend"
    else:
        response.status = 404
        return "Frontend not found"

@action('static/dashboard')
@action('static/create-recipe')  
@action('static/login')
@action('static/register')
@action('static/contact')
@action('static/about')
def serve_common_spa_routes():
    """Serve React app for common routes"""
    static_folder = os.path.join(os.path.dirname(__file__), 'static')
    index_html_path = os.path.join(static_folder, 'index.html')
    
    logger.info("Serving React SPA for common route")
    
    if os.path.isfile(index_html_path):
        response.headers['Content-Type'] = 'text/html'
        try:
            with open(index_html_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error serving index.html: {str(e)}")
            response.status = 500
            return "Error serving frontend"
    else:
        response.status = 404
        return "Frontend not found"