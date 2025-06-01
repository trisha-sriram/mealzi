import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';

const ShareableRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getRecipeDetail(id);
      if (response.success) {
        setRecipe(response.recipe);
      } else {
        setError(response.error || 'Recipe not found');
      }
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Failed to load recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      // You could add a toast notification here
      alert('Recipe link copied to clipboard!');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/recipes')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse All Recipes
          </button>
        </motion.div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header with share button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/recipes')}
            className="flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Recipes
          </button>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Recipe
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Recipe Header */}
          <div className="relative">
            {recipe.image ? (
              <img
                src={`${apiService.baseURL}/uploads/${recipe.image}`}
                alt={recipe.name}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
                <p className="text-lg opacity-90">by {recipe.author_name}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Recipe Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{recipe.servings}</div>
                <div className="text-sm text-gray-600">Servings</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{recipe.type}</div>
                <div className="text-sm text-gray-600">Category</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {recipe.nutrition_per_serving?.calories || 0}
                </div>
                <div className="text-sm text-gray-600">Calories/Serving</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>
              <div className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center py-2 px-4 bg-gray-50 rounded-lg overflow-x-auto"
                    style={{ minWidth: 0 }}
                  >
                    <span className="flex-1 truncate font-medium text-gray-800">{ingredient.name}</span>
                    <span className="w-24 text-base text-black font-normal text-right whitespace-nowrap overflow-hidden truncate">{ingredient.quantity_per_serving} {ingredient.unit}</span>
                    <span className="w-20 ml-4 text-base text-yellow-800 font-normal text-right break-words">
                      {ingredient.calories} kcal
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
              <div className="space-y-4">
                {recipe.instruction_steps?.split('\n').filter(step => step.trim()).map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step.trim()}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Nutrition Information */}
            {recipe.nutrition_per_serving && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nutrition Per Serving</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutrition_per_serving).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-800">
                        {typeof value === 'number' ? Math.round(value * 10) / 10 : value}
                        {key === 'calories' ? '' : key === 'sodium' ? 'mg' : 'g'}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key === 'carbs' ? 'Carbohydrates' : key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recipe Meta */}
            <div className="border-t pt-6 text-center text-gray-500">
              <p>Created on {formatDate(recipe.created_on)}</p>
              <p className="mt-2 text-sm">
                Share this recipe: <span className="font-mono text-green-600">{window.location.href}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 mb-4">Love this recipe? Discover more amazing recipes!</p>
          <button
            onClick={() => navigate('/recipes')}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors mr-4"
          >
            Browse All Recipes
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Join Our Community
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ShareableRecipe; 