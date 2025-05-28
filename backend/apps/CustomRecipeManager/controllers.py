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

# ==============================================================
# -------------------- INGREDIENT SEARCH -----------------------
# ==============================================================

@action('api/ingredients/search', method=['GET'])
@action.uses(db)
def ingredients_search():
    """Search ingredients with pagination"""
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
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
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

# ==============================================================
# ------------------- AUTHENTICATION API -----------------------
# ==============================================================

@action('api/auth/register', method=['POST'])
@action.uses(db, session, auth)
def auth_register():
    """Register a new user"""
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'

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
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'

    try:
        data = request.json or {}
        if not {'email', 'password'}.issubset(data):
            response.status = 400
            return {"error": "Missing required fields: email, password"}

        user, success = auth.login(data['email'], data['password']) or (None, None)
        if user:
            user_dict = (user.as_dict() if hasattr(user, 'as_dict') else {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            })
            return {
                "success": True,
                "message": "Login successful",
                "user": user_dict,
                "redirect": "/dashboard"
            }

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
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    session.clear()
    return {"success": True, "message": "Logout successful"}

@action('api/auth/user', method=['GET'])
@action.uses(db, session, auth)
def auth_user():
    """Return current user info"""
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'

    if auth.current_user:
        u = auth.current_user
        return {
            "success": True,
            "user": {
                "id": u.id,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name
            }
        }
    response.status = 401
    return {"error": "Not authenticated"}

# -------- CORS OPTION handlers for auth --------
for _path in ('register', 'login', 'logout', 'user'):
    @action(f'api/auth/{_path}', method=['OPTIONS'])
    def _auth_opts():
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return ""

# ==============================================================
# ------------------ RECIPE CRUD ENDPOINTS ---------------------
# ==============================================================

@action('api/recipes', method=['POST'])
@action.uses(db, session, auth.user)
def create_recipe():
    """Create a new recipe (authenticated)"""
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'

    try:
        data = request.json or {}
        required = {'name', 'type', 'description', 'instruction_steps', 'servings'}
        if not required.issubset(data):
            response.status = 400
            return {"error": "Missing required fields"}

        recipe_id = db.recipe.insert(
            name=data['name'],
            type=data['type'],
            description=data['description'],
            instruction_steps=data['instruction_steps'],
            servings=data['servings'],
            author=auth.current_user.id
        )

        for ing in data.get('ingredients', []):
            db.recipe_ingredient.insert(
                recipe_id=recipe_id,
                ingredient_id=ing['ingredient_id'],
                quantity_per_serving=ing['quantity_per_serving']
            )

        return {
            "success": True,
            "recipe_id": recipe_id,
            "message": "Recipe created successfully"
        }
    except Exception as e:
        logger.error(f"Recipe creation error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Failed to create recipe"}

@action('api/recipes', method=['GET'])
@action.uses(db, session, auth.user)
def get_recipes():
    """Return recipes authored by current user"""
    response.headers['Access-Control-Allow-Origin']   = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods']  = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers']  = 'Content-Type'

    try:
        recipes = db(db.recipe.author == auth.current_user.id).select(
            orderby=~db.recipe.created_on
        ).as_list()

        return {"success": True, "recipes": recipes}
    except Exception as e:
        logger.error(f"Get recipes error: {e}\n{traceback.format_exc()}")
        response.status = 500
        return {"error": "Failed to get recipes"}

@action('api/recipes', method=['OPTIONS'])
def recipes_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

# ==============================================================
# ------------------- CONTACT FORM ENDPOINT --------------------
# ==============================================================

@action('api/contact', method=['POST'])
@action.uses(db)
def submit_contact():
    """Contact-us form"""
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'

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
                        f"Thanks for reaching out about “{data['subject']}”. "
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

