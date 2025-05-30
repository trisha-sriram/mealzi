import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const API_BASE_URL = apiService.baseURL;

const RecipeDetailModal = ({ recipeId, isOpen, onClose }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && recipeId) {
      fetchRecipeDetails();
    }
  }, [isOpen, recipeId]);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getRecipeDetail(recipeId);
      if (response.success) {
        setRecipe(response.recipe);
      } else {
        setError(response.error || 'Failed to load recipe details');
      }
    } catch (err) {
      setError('Failed to load recipe details');
      console.error('Error fetching recipe details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInstructionSteps = (instructionText) => {
    if (!instructionText) return [];
    return instructionText.split('\n').filter(step => step.trim());
  };

  const RecipeTypeBadge = ({ type }) => {
    const colors = {
      Breakfast: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      Lunch: 'bg-gradient-to-r from-green-400 to-emerald-400',
      Dinner: 'bg-gradient-to-r from-blue-400 to-indigo-400',
      Snack: 'bg-gradient-to-r from-purple-400 to-pink-400',
      Dessert: 'bg-gradient-to-r from-pink-400 to-rose-400',
      Drink: 'bg-gradient-to-r from-cyan-400 to-blue-400'
    };

    return (
      <span className={`px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg ${colors[type] || 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
        {type}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Recipe Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-4xl text-emerald-600"
                >
                  🍳
                </motion.div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="text-4xl mb-4">😞</div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            ) : recipe ? (
              <div className="p-6 space-y-8">
                {/* Recipe Header */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <h1 className="text-4xl font-bold text-gray-800">{recipe.name}</h1>
                    <RecipeTypeBadge type={recipe.type} />
                  </div>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">{recipe.description}</p>
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      By {recipe.author_name}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(recipe.created_on)}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {recipe.servings} servings
                    </span>
                  </div>
                </div>

                {/* Recipe Image */}
                {recipe.image && (
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-md">
                      <img
                        src={`${API_BASE_URL}/uploads/${recipe.image}`}
                        alt={recipe.name}
                        className="w-full h-64 object-cover rounded-2xl shadow-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Nutrition Info */}
                {recipe.nutrition_per_serving && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Nutrition Per Serving</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-red-600">{recipe.nutrition_per_serving.calories}</div>
                        <div className="text-sm text-gray-600">Calories</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{recipe.nutrition_per_serving.protein}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-emerald-600">{recipe.nutrition_per_serving.carbs}g</div>
                        <div className="text-sm text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-amber-600">{recipe.nutrition_per_serving.fat}g</div>
                        <div className="text-sm text-gray-600">Fat</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Ingredients */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      🥕 Ingredients
                    </h3>
                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                      <div className="space-y-3">
                        {recipe.ingredients.map((ingredient, index) => (
                          <motion.div
                            key={ingredient.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-medium text-gray-800">{ingredient.name}</span>
                            <span className="text-emerald-600 font-bold">
                              {ingredient.quantity_per_serving} {ingredient.unit}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No ingredients listed</p>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      👨‍🍳 Instructions
                    </h3>
                    {getInstructionSteps(recipe.instruction_steps).length > 0 ? (
                      <div className="space-y-3">
                        {getInstructionSteps(recipe.instruction_steps).map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed">{step}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No instructions provided</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeDetailModal; 