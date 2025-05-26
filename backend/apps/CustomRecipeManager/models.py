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
    Field('image', 'upload'),
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

db.commit()

