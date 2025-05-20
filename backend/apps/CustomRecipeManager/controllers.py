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
from py4web import URL, abort, action, redirect, request
from .common import (T, auth, authenticated, cache, db, flash, logger, session,
                     unauthenticated)
@action('api/ingredients_search', method=["GET"])
@action.uses(db)
def ingredients_search():
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
