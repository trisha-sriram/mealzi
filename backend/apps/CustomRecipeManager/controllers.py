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

def set_cors_headers():
    """Set CORS headers based on request origin"""
    origin = request.headers.get('Origin', 'http://localhost:5173')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Content-Type'] = 'application/json'

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

    print("=== CREATE RECIPE DEBUG ===")
    print("Request headers:", dict(request.headers))
    print("Session in create_recipe:", dict(session))
    print("Auth current_user:", auth.current_user)
    print("=========================")

    if not auth.current_user:
        response.status = 401
        return {"error": "Not authenticated", "session": dict(session)}

    try:
        data = request.json
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
            author=auth.current_user['id'],
            created_on=datetime.datetime.utcnow()
        )
        
        # Get the created recipe
        recipe = db.recipe[recipe_id]
        
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
            formatted_recipe = {
                'id': recipe['recipe']['id'],
                'name': recipe['recipe']['name'],
                'type': recipe['recipe']['type'],
                'description': recipe['recipe']['description'],
                'instruction_steps': recipe['recipe']['instruction_steps'],
                'servings': recipe['recipe']['servings'],
                'created_on': recipe['recipe']['created_on'],
                'author': recipe['recipe']['author'],
                'author_name': f"{recipe['auth_user']['first_name']} {recipe['auth_user']['last_name']}"
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
            formatted_recipe = {
                'id': recipe['recipe']['id'],
                'name': recipe['recipe']['name'],
                'type': recipe['recipe']['type'],
                'description': recipe['recipe']['description'],
                'instruction_steps': recipe['recipe']['instruction_steps'],
                'servings': recipe['recipe']['servings'],
                'created_on': recipe['recipe']['created_on'],
                'author': recipe['recipe']['author'],
                'author_name': f"{recipe['auth_user']['first_name']} {recipe['auth_user']['last_name']}"
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


