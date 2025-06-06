import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

const ShareableRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [servings, setServings] = useState(0);
  const [originalServings, setOriginalServings] = useState(0);
  const [scaledIngredients, setScaledIngredients] = useState([]);

  useEffect(() => {
    loadRecipe();
  }, [id]);
  
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
          scaled_calories: Math.round(ingredient.calories_per_unit * formattedQuantity)
        };
      });
      
      setScaledIngredients(scaled);
    }
  }, [servings, originalServings, recipe]);

  const loadRecipe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getRecipeDetail(id);
      if (response.success) {
        setRecipe(response.recipe);
        setAllImages([
          ...(response.recipe.image ? [response.recipe.image] : []),
          ...(response.recipe.images || [])
        ]);
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

  const handleServingsChange = (newServings) => {
    if (newServings < 1) return;
    setServings(newServings);
  };

  const handleEdit = () => {
    navigate(`/create-recipe?edit=${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return;
    try {
      await apiService.deleteRecipe(id);
      alert('Recipe deleted successfully.');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete recipe.');
    }
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
            {allImages.length > 0 ? (
              <div className="relative w-full h-80 bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-3xl shadow-2xl border-4 border-white overflow-hidden">
                <motion.img
                  key={allImages[currentImageIndex]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={allImages[currentImageIndex].startsWith('http') ? allImages[currentImageIndex] : `/CustomRecipeManager/uploads/${allImages[currentImageIndex]}`}
                  alt={`${recipe.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain drop-shadow-lg"
                  style={{ background: 'white' }}
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 text-emerald-600 rounded-full shadow-lg hover:bg-opacity-100 hover:scale-110 transition"
                      aria-label="Previous image"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 text-emerald-600 rounded-full shadow-lg hover:bg-opacity-100 hover:scale-110 transition"
                      aria-label="Next image"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`transition-all duration-200 w-3 h-3 rounded-full shadow ${index === currentImageIndex ? 'bg-emerald-500 scale-125' : 'bg-gray-300 scale-100'}`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute bottom-6 left-6 w-auto max-w-[90%] flex flex-col items-start">
                  <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-green-400 px-6 py-2 rounded-2xl shadow-lg flex flex-col items-start backdrop-blur-sm">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-0.5 whitespace-nowrap drop-shadow-sm">{recipe.name}</h1>
                    <span className="text-xs text-green-50 font-light drop-shadow-sm">by {recipe.author_name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Recipe Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-lg flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => handleServingsChange(servings - 1)}
                    disabled={servings <= 1}
                    className={`w-6 h-6 flex items-center justify-center rounded-full ${
                      servings <= 1 ? 'text-gray-300' : 'text-green-600 hover:bg-green-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-2xl font-bold text-green-600">{servings}</span>
                  <button 
                    onClick={() => handleServingsChange(servings + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-green-600 hover:bg-green-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleServingsChange(originalServings)}
                    disabled={servings === originalServings}
                    className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full ${
                      servings === originalServings 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                    title="Reset to original servings"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <div className="text-sm text-gray-600">Servings</div>
                {servings !== originalServings && (
                  <div className="text-xs text-green-600 mt-1">
                    (Original: {originalServings})
                  </div>
                )}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                Ingredients
                {servings !== originalServings && (
                  <span className="ml-2 text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Scaled for {servings} servings
                  </span>
                )}
              </h2>
              <div className="space-y-2">
                {scaledIngredients.map((ingredient, index) => (
                  <motion.div
                    key={`${ingredient.id || index}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center py-2 px-4 bg-gray-50 rounded-lg overflow-x-auto"
                    style={{ minWidth: 0 }}
                  >
                    <span className="flex-1 truncate font-medium text-gray-800">{ingredient.name}</span>
                    <span className="w-24 text-base text-black font-normal text-right whitespace-nowrap overflow-hidden truncate">
                      {ingredient.scaled_quantity || ingredient.quantity_per_serving} {ingredient.unit}
                    </span>
                    <span className="w-20 ml-4 text-base text-yellow-800 font-normal text-right break-words">
                      {ingredient.scaled_calories || ingredient.calories} kcal
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
              <div className="space-y-4">
                {(() => {
                  let steps = [];
                  try {
                    // First try to parse as JSON (for user-created recipes)
                    steps = JSON.parse(recipe.instruction_steps);
                    if (!Array.isArray(steps)) throw new Error();
                  } catch {
                    // Handle different instruction formats
                    if (recipe.instruction_steps) {
                      const instructionText = recipe.instruction_steps.trim();
                      
                      // Check if it's a single long instruction (like MealDB recipes)
                      if (instructionText.includes('.') && !instructionText.startsWith('[')) {
                        // Split by sentences ending with periods, but keep sentences together
                        steps = instructionText
                          .split(/(?<=[.!?])\s+(?=[A-Z])/)
                          .map(s => s.trim())
                          .filter(s => s.length > 10); // Filter out very short fragments
                      } else {
                        // Handle JSON-like strings or comma-separated values
                        steps = instructionText
                          .replace(/^\[|\]$/g, '')
                          .split(',')
                          .map(s => s.replace(/['"]/g, '').trim())
                          .filter(Boolean);
                      }
                    }
                  }
                  
                  return steps.map((step, index) => (
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
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </motion.div>
                  ));
                })()}
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

            {/* Edit/Delete Buttons for Owner */}
            {user && recipe && user.id === recipe.author && (
              <div className="flex justify-center gap-4 p-6 border-t border-gray-200 mb-8">
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