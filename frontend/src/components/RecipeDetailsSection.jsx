import React from 'react';

const RECIPE_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'];

const RecipeDetailsSection = ({ recipeData, updateRecipeData }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateRecipeData('image', file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recipe Details</h2>
        <p className="text-gray-600 mb-6">
          Let's start with the basic information about your recipe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipe Name */}
        <div className="md:col-span-2">
          <label htmlFor="recipe-name" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Name *
          </label>
          <input
            type="text"
            id="recipe-name"
            value={recipeData.name}
            onChange={(e) => updateRecipeData('name', e.target.value)}
            placeholder="Enter a delicious recipe name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        {/* Recipe Type */}
        <div>
          <label htmlFor="recipe-type" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Type *
          </label>
          <select
            id="recipe-type"
            value={recipeData.type}
            onChange={(e) => updateRecipeData('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          >
            <option value="" disabled>Select a type</option>
            {RECIPE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Servings */}
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
            Servings *
          </label>
          <input
            type="number"
            id="servings"
            min="1"
            max="100"
            value={recipeData.servings}
            onChange={(e) => updateRecipeData('servings', parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            rows={4}
            value={recipeData.description}
            onChange={(e) => updateRecipeData('description', e.target.value)}
            placeholder="Describe your recipe... What makes it special? Any tips or background?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label htmlFor="recipe-image" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Image (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="recipe-image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="recipe-image"
                    name="recipe-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {recipeData.image && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Selected: {recipeData.image.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Recipe Details Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Choose a descriptive name that makes people want to try your recipe</li>
                <li>Select the most appropriate meal type for better discoverability</li>
                <li>Be accurate with serving sizes to help with nutrition calculations</li>
                <li>Write a compelling description that tells the story of your dish</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsSection; 