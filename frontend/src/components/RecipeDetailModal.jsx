import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

// API calls use /CustomRecipeManager, but frontend routes use /CustomRecipeManager/static
const API_BASE_URL = '/CustomRecipeManager';

const RecipeDetailModal = ({ recipeId, isOpen, onClose, currentUser, onRecipeDeleted }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [servings, setServings] = useState(1);
  const [originalServings, setOriginalServings] = useState(0);
  const [scaledIngredients, setScaledIngredients] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && recipeId) {
      fetchRecipeDetails();
    }
  }, [isOpen, recipeId]);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
      setOriginalServings(recipe.servings);
      setScaledIngredients(recipe.ingredients || []);
    }
  }, [recipe]);

  useEffect(() => {
    if (recipe && recipe.ingredients && originalServings > 0) {
      // Scale ingredients based on servings ratio
      const scaleFactor = servings / originalServings;
      
      const scaled = recipe.ingredients.map(ingredient => {
        const scaledQuantity = ingredient.quantity_per_serving * scaleFactor;
        // Format the quantity to avoid too many decimal places
        const formattedQuantity = scaledQuantity >= 10 
          ? Math.round(scaledQuantity) 
          : Number(scaledQuantity.toFixed(1));
        
        return {
          ...ingredient,
          scaled_quantity: formattedQuantity,
        };
      });
      
      setScaledIngredients(scaled);
    }
  }, [servings, originalServings, recipe]);

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
    let steps = [];
    try {
      // First try to parse as JSON (for user-created recipes)
      steps = JSON.parse(instructionText);
      if (!Array.isArray(steps)) throw new Error();
    } catch {
      // Handle different instruction formats
      const text = instructionText.trim();
      
      // Check if it's a single long instruction (like MealDB recipes)
      if (text.includes('.') && !text.startsWith('[')) {
        // Split by sentences ending with periods, but keep sentences together
        steps = text
          .split(/(?<=[.!?])\s+(?=[A-Z])/)
          .map(s => s.trim())
          .filter(s => s.length > 10); // Filter out very short fragments
      } else {
        // Handle JSON-like strings or comma-separated values
        steps = text
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(s => s.replace(/['"]/g, '').trim())
          .filter(Boolean);
      }
    }
    return steps;
  };

  const handleServingsChange = (newServings) => {
    if (newServings < 1) return;
    setServings(newServings);
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % recipe.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + recipe.images.length) % recipe.images.length);
  };

  const handleEdit = () => {
    // Redirect to edit page with recipeId (implement edit mode in CreateRecipePage)
    navigate(`/create-recipe?edit=${recipeId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return;
    try {
      await apiService.deleteRecipe(recipeId);
      if (onRecipeDeleted) onRecipeDeleted(recipeId);
      onClose();
    } catch (err) {
      alert('Failed to delete recipe.');
    }
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
            <div className="flex items-center gap-2">
              {recipe && (
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/CustomRecipeManager/static/recipe/${recipe.id}`;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      alert('Recipe link copied to clipboard!');
                    });
                  }}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600"
                  title="Copy share link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleServingsChange(servings - 1)}
                          disabled={servings <= 1}
                          className={`w-6 h-6 flex items-center justify-center rounded-full ${
                            servings <= 1 ? 'text-gray-300' : 'text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="mx-2 font-medium text-emerald-700">{servings} servings</span>
                        <button 
                          onClick={() => handleServingsChange(servings + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                          </svg>
                        </button>
                      </div>
                      <button 
                        onClick={() => handleServingsChange(originalServings)}
                        disabled={servings === originalServings}
                        className={`ml-3 text-xs px-2 py-1 rounded-full flex items-center ${
                          servings === originalServings 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                        }`}
                        title="Reset to original servings"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recipe Images */}
                {(() => {
                  // Combine main image and additional images
                  const allImages = [
                    ...(recipe.image ? [recipe.image] : []),
                    ...(recipe.images || [])
                  ];
                  return allImages.length > 0 ? (
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-md">
                        <img
                          src={allImages[currentImageIndex].startsWith('http') ? allImages[currentImageIndex] : `/CustomRecipeManager/uploads/${allImages[currentImageIndex]}`}
                          alt={`${recipe.name} - Image ${currentImageIndex + 1}`}
                          className="w-full h-64 object-cover rounded-2xl shadow-lg"
                        />
                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
                              aria-label="Previous image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
                              aria-label="Next image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                              {allImages.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                  aria-label={`Go to image ${index + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}

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
                      {servings !== originalServings && (
                        <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          Scaled for {servings} servings
                        </span>
                      )}
                    </h3>
                    {scaledIngredients && scaledIngredients.length > 0 ? (
                      <div className="space-y-3">
                        {scaledIngredients.map((ingredient, index) => (
                          <motion.div
                            key={`${ingredient.id}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <span className="flex-1">{ingredient.name}</span>
                            <span className="w-20 text-xs text-black font-normal text-right">
                              {ingredient.scaled_quantity || ingredient.quantity_per_serving} {ingredient.unit}
                            </span>
                            <span className="w-16 ml-4 text-xs text-yellow-800 font-normal text-right">
                              {Math.round((ingredient.scaled_quantity || ingredient.quantity_per_serving) * ingredient.calories_per_unit)} kcal
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

                {recipe && currentUser && (currentUser.id == recipe.author) && (
                  <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                    <button
                      onClick={handleEdit}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all"
                    >
                      Edit Recipe
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all"
                    >
                      Delete Recipe
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeDetailModal; 