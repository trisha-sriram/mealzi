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

@action('api/ingredients_search', method=["GET"])
@action.uses(db)
def ingredients_search():
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
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
@action.uses(db)
def create_recipe():
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    # TODO: Implement recipe creation endpoint
    response.status = 501
    return {"error": "Recipe creation endpoint not yet implemented"}


@action('api/contact', method=["POST"])
@action.uses(db)
def submit_contact():
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
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
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

@action('api/ingredients_search', method=["OPTIONS"])
def ingredients_search_options():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

@action('api/recipes', method=["OPTIONS"])
def recipes_options():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return ""

