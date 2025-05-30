#!/usr/bin/env python3
"""
Cleanup script to remove TheMealDB data from the database
This allows testing the automatic import functionality
"""

import sys
import os

# Add the py4web path to import the database
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

try:
    from apps.CustomRecipeManager.models import db
except ImportError as e:
    print(f"Error importing database models: {e}")
    print("Make sure you're running this script from the py4web backend directory")
    sys.exit(1)

def cleanup_themealdb_data():
    """Clean up all TheMealDB data from the database"""
    try:
        print("Cleaning up TheMealDB data...")
        
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
            print("Deleted TheMealDB admin user")
        
        db.commit()
        print(f"✅ Cleaned up {recipe_count} recipes and {ingredient_count} ingredients")
        print("✅ Database is now ready for fresh TheMealDB import")
        return True
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("TheMealDB Database Cleanup Script")
    print("=" * 50)
    
    result = cleanup_themealdb_data()
    
    if result:
        print("\n🎉 Cleanup completed successfully!")
        print("Now restart py4web to see the automatic import in action:")
        print("   py4web run apps")
    else:
        print("\n❌ Cleanup failed!")
    
    print("=" * 50) 