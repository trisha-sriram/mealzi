"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""
import json
from yatl.helpers import A
from py4web import URL, abort, action, redirect, request, response
from .common import (T, auth, authenticated, cache, db, flash, logger, session,
                     unauthenticated)
from . import settings

# ===================== AUTHENTICATION ENDPOINTS =====================

@action('api/auth/register', method=['POST'])
@action.uses(db, session, auth)
def auth_register():
    """Register a new user"""
    # Add comprehensive CORS headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'  # Updated to correct frontend URL
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'  # Important for credentials: 'include'
    
    logger.info("=== AUTH REGISTER ENDPOINT CALLED ===")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Content-Type: {request.headers.get('Content-Type', 'Not set')}")
    logger.info(f"Origin: {request.headers.get('Origin', 'Not set')}")
    
    try:
        logger.info("Attempting to parse request.json...")
        data = request.json
        logger.info(f"Received data keys: {list(data.keys()) if data else 'No data'}")
        
        # Validate required fields
        if not data or not all(field in data for field in ['email', 'password', 'first_name']):
            logger.error(f"Missing required fields. Data: {data}")
            response.status = 400
            return {"error": "Missing required fields: email, password, first_name"}
        
        logger.info(f"Checking if user exists with email: {data['email']}")
        # Check if user already exists
        existing_user = db(db.auth_user.email == data['email']).select().first()
        if existing_user:
            logger.warning(f"User already exists with email: {data['email']}")
            response.status = 400
            return {"error": "User with this email already exists"}
        
        logger.info("Attempting to register user with py4web auth...")
        # Register the user by inserting directly into auth_user table
        # py4web auth.register() has different parameters than expected
        from pydal.validators import CRYPT
        
        user_id = db.auth_user.insert(
            email=data['email'],
            password=CRYPT()(data['password'])[0],  # Hash the password
            first_name=data['first_name'],
            last_name=data.get('last_name', ''),
            username=data['email']  # Use email as username
        )
        
        logger.info(f"Registration result - user_id: {user_id}")
        
        if user_id:
            # Get the created user info
            user = db.auth_user[user_id]
            logger.info(f"User successfully created: {user.id}, {user.email}")
            return {
                "success": True,
                "message": "Registration successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name
                }
            }
        else:
            logger.error("Registration failed - user_id is None or False")
            response.status = 400
            return {"error": "Registration failed"}
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        response.status = 500
        return {"error": "Registration failed. Please try again."}

@action('api/auth/login', method=['POST'])
@action.uses(db, session, auth)
def auth_login():
    """Login user"""
    # Add comprehensive CORS headers to match register endpoint
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'  # Match your frontend URL
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'  # Important for credentials: 'include'
    
    try:
        # Get the JSON data from the request
        data = request.json
        logger.info("=== AUTH LOGIN ENDPOINT CALLED ===")
        logger.info(f"Request method: {request.method}")
        logger.info("Attempting to parse login request...")
        logger.info(f"Login attempt for email: {data['email']}")
        
        # Validate required fields
        if not data or not all(field in data for field in ['email', 'password']):
            response.status = 400
            return {"error": "Missing required fields: email, password"}
        
        # Use py4web's auth.login() method
        login_result = auth.login(data['email'], data['password'])
        logger.info(f"Login result type: {type(login_result)}")
        logger.info(f"Login result: {login_result}")
        
        # Handle the tuple return from auth.login()
        if login_result and len(login_result) >= 2:
            user, success = login_result
            logger.info(f"User type: {type(user)}, Success: {success}")
            
            # Check if user exists (success might be None but user is valid)
            if user and hasattr(user, 'id'):
                # Check if user is a Row object or dict-like
                if hasattr(user, 'as_dict'):
                    # It's a Row object, convert to dict
                    user_dict = user.as_dict()
                elif hasattr(user, 'id'):
                    # It's already accessible as object
                    user_dict = {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name
                    }
                else:
                    # Fallback: get user from database using the returned info
                    logger.info("User object doesn't have expected attributes, fetching from DB")
                    db_user = db(db.auth_user.email == data['email']).select().first()
                    if db_user:
                        user_dict = {
                            "id": db_user.id,
                            "email": db_user.email,
                            "first_name": db_user.first_name,
                            "last_name": db_user.last_name
                        }
                    else:
                        response.status = 401
                        return {"error": "User not found after login"}
                
                return {
                    "success": True,
                    "message": "Login successful",
                    "user": user_dict
                }
        
        response.status = 401
        return {"error": "Invalid email or password"}
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        response.status = 500
        return {"error": "Login failed. Please try again."}

@action('api/auth/logout', method=['POST'])
@action.uses(db, session, auth)
def auth_logout():
    """Logout user"""
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'true'
    
    try:
        auth.logout()
        return {"success": True, "message": "Logout successful"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        response.status = 500
        return {"error": "Logout failed"}

@action('api/auth/user', method=['GET'])
@action.uses(db, session, auth)
def auth_user():
    """Get current user info"""
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'true'
    
    try:
        if auth.current_user:
            user = auth.current_user
            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name
                }
            }
        else:
            response.status = 401
            return {"error": "Not authenticated"}
            
    except Exception as e:
        logger.error(f"User info error: {str(e)}")
        response.status = 500
        return {"error": "Failed to get user info"}

# ===================== EXISTING API ENDPOINTS =====================

@action('api/ingredients_search', method=["GET"])
@action.uses(db)
def ingredients_search():
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    query = request.params.get('query', '').strip().lower()
    if not query:
        ingredients = []
    else:
        ingredients = db(db.ingredient.name.ilike(f"%{query}%")).select(
            db.ingredient.name, 
            db.ingredient.unit,
            db.ingredient.calories_per_unit,
            db.ingredient.protein_per_unit,  
            db.ingredient.fat_per_unit, 
            db.ingredient.carbs_per_unit,
            db.ingredient.sugar_per_unit,
            db.ingredient.fiber_per_unit,
            db.ingredient.sodium_per_unit,
            orderby=db.ingredient.name, 
            limitby=(0, 20)
        ).as_list()
    response.headers['Content-Type'] = 'application/json'
    return json.dumps(ingredients)


@action('api/recipes', method=["POST"])
@action.uses(db, session, auth.user)  # Require authentication for recipe creation
def create_recipe():
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    try:
        data = request.json
        
        # Validate required fields
        if not data or not all(field in data for field in ['name', 'type', 'description', 'instruction_steps', 'servings']):
            response.status = 400
            return {"error": "Missing required fields"}
        
        # Create recipe
        recipe_id = db.recipe.insert(
            name=data['name'],
            type=data['type'],
            description=data['description'],
            instruction_steps=data['instruction_steps'],
            servings=data['servings'],
            author=auth.current_user.id
        )
        
        # Insert recipe ingredients if provided
        if data.get('ingredients'):
            for ingredient_data in data['ingredients']:
                db.recipe_ingredient.insert(
                    recipe_id=recipe_id,
                    ingredient_id=ingredient_data['ingredient_id'],
                    quantity_per_serving=ingredient_data['quantity_per_serving']
                )
        
        response.headers['Content-Type'] = 'application/json'
        return {"success": True, "recipe_id": recipe_id, "message": "Recipe created successfully"}
        
    except Exception as e:
        logger.error(f"Recipe creation error: {str(e)}")
        response.status = 500
        return {"error": "Failed to create recipe"}

@action('api/recipes', method=["GET"])
@action.uses(db, session, auth.user)  # Require authentication for recipe access
def get_recipes():
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    try:
        # Get recipes for the current user
        recipes = db(db.recipe.author == auth.current_user.id).select(
            orderby=~db.recipe.created_on
        ).as_list()
        
        response.headers['Content-Type'] = 'application/json'
        return {"success": True, "recipes": recipes}
        
    except Exception as e:
        logger.error(f"Get recipes error: {str(e)}")
        response.status = 500
        return {"error": "Failed to get recipes"}

@action('api/contact', method=["POST"])
@action.uses(db)
def submit_contact():
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    try:
        # Get the JSON data from the request
        data = request.json
        
        # Validate required fields
        if not data or not all(field in data for field in ['name', 'email', 'subject', 'message']):
            response.status = 400
            return {"error": "Missing required fields: name, email, subject, message"}
        
        # Insert the contact message into the database
        contact_id = db.contact.insert(
            name=data['name'],
            email=data['email'], 
            subject=data['subject'],
            message=data['message']
        )
        
        if contact_id:
            # Send email notification if mailer is configured
            try:
                if auth.sender and hasattr(settings, 'CONTACT_NOTIFICATION_EMAIL'):
                    
                    # Email to admin
                    admin_subject = f"New Contact Form Submission: {data['subject']}"
                    admin_message = f"""
New contact form submission received:

From: {data['name']} <{data['email']}>
Subject: {data['subject']}

Message:
{data['message']}

---
Contact ID: {contact_id}
Submitted via Mealzi Contact Form
                    """
                    
                    auth.sender.send(
                        to=[settings.CONTACT_NOTIFICATION_EMAIL],
                        subject=admin_subject,
                        body=admin_message
                    )
                    
                    # Confirmation email to user
                    user_subject = "Thank you for contacting Mealzi!"
                    user_message = f"""
Hi {data['name']},

Thank you for reaching out to us! We've received your message about "{data['subject']}" and will get back to you within 24 hours.

Your message:
{data['message']}

Best regards,
The Mealzi Team

---
This is an automated response. Please do not reply to this email.
                    """
                    
                    auth.sender.send(
                        to=[data['email']],
                        subject=user_subject,
                        body=user_message
                    )
                    logger.info(f"User confirmation email sent successfully")
                    
                else:
                    logger.warning("Email not configured - auth.sender or CONTACT_NOTIFICATION_EMAIL missing")
                    
            except Exception as email_error:
                logger.error(f"Failed to send contact form emails: {str(email_error)}")
                import traceback
                logger.error(f"Email error traceback: {traceback.format_exc()}")
                # Don't fail the request if email fails, but log it
            
            response.headers['Content-Type'] = 'application/json'
            return {"success": True, "message": "Your message has been sent successfully!", "id": contact_id}
        else:
            response.status = 500
            return {"error": "Failed to save your message. Please try again."}
            
    except Exception as e:
        logger.error(f"Error in contact submission: {str(e)}")
        response.status = 500
        return {"error": "An unexpected error occurred. Please try again later."}


# Handle CORS preflight requests
@action('api/contact', method=["OPTIONS"])
def contact_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

@action('api/ingredients_search', method=["OPTIONS"])
def ingredients_search_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

@action('api/recipes', method=["OPTIONS"])
def recipes_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

# Authentication CORS handlers
@action('api/auth/register', method=["OPTIONS"])
def auth_register_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return ""

@action('api/auth/login', method=["OPTIONS"])
def auth_login_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return ""

@action('api/auth/logout', method=["OPTIONS"])
def auth_logout_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'true'
    return ""

@action('api/auth/user', method=["OPTIONS"])
def auth_user_options():
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'true'
    return ""

