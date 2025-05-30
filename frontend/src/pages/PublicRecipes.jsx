import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import RecipeDetailModal from '../components/RecipeDetailModal';

const API_BASE_URL = apiService.baseURL;

const RecipeTypeBadge = ({ type }) => {
  const colors = {
    Breakfast: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
    Lunch: 'bg-gradient-to-r from-green-400 to-emerald-400 text-white',
    Dinner: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white',
    Snack: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white',
    Dessert: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
    Drink: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${colors[type] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'}`}>
      {type}
    </span>
  );
};

const RecipeCard = ({ recipe, index, onViewRecipe }) => {
  const [imageError, setImageError] = useState(false);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleImageError = () => {
    setImageError(true);
  };

  const copyShareLink = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/recipe/${recipe.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      // You could add a toast notification here
      alert('Recipe link copied to clipboard!');
    });
  };

  const openShareableRecipe = (e) => {
    e.stopPropagation();
    window.open(`/recipe/${recipe.id}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:border-emerald-200 transition-all duration-300 group"
    >
      {/* Recipe Image */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 overflow-hidden">
        {recipe.image && !imageError ? (
          <img
            src={`${API_BASE_URL}/uploads/${recipe.image}`}
            alt={recipe.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-6xl opacity-80"
            >
              🍽️
            </motion.div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
        
        <div className="absolute top-4 left-4">
          <RecipeTypeBadge type={recipe.type} />
        </div>

        {/* Share Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={copyShareLink}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Copy share link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{recipe.name}</h3>
          <p className="text-sm opacity-90 drop-shadow">
            By {recipe.author_name || 'Unknown Chef'}
          </p>
        </div>
      </div>
      
      {/* Recipe Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
          {recipe.description || "No description available"}
        </p>

        {/* Recipe Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">{recipe.servings} servings</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-emerald-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium text-emerald-700">{formatDate(recipe.created_on)}</span>
          </div>
        </div>

        {/* Nutrition Info */}
        {(recipe.total_calories || recipe.total_protein || recipe.total_carbs || recipe.total_fat) && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="text-sm font-bold text-red-600">{Math.round((recipe.total_calories || 0) / (recipe.servings || 1))}</div>
              <div className="text-xs text-red-500">Cal</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-sm font-bold text-blue-600">{Math.round((recipe.total_protein || 0) / (recipe.servings || 1))}g</div>
              <div className="text-xs text-blue-500">Protein</div>
            </div>
            <div className="text-center p-2 bg-emerald-50 rounded-lg">
              <div className="text-sm font-bold text-emerald-600">{Math.round((recipe.total_carbs || 0) / (recipe.servings || 1))}g</div>
              <div className="text-xs text-emerald-500">Carbs</div>
            </div>
            <div className="text-center p-2 bg-amber-50 rounded-lg">
              <div className="text-sm font-bold text-amber-600">{Math.round((recipe.total_fat || 0) / (recipe.servings || 1))}g</div>
              <div className="text-xs text-amber-500">Fat</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewRecipe(recipe.id)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Quick View
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openShareableRecipe}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Full Page
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const PublicRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const openRecipeModal = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setIsModalOpen(true);
  };

  const closeRecipeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipeId(null);
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await apiService.getPublicRecipes();
        setRecipes(response.recipes || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recipes. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-emerald-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4 text-emerald-600"
          >
            🍳
          </motion.div>
          <p className="text-xl text-emerald-800 font-medium">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-emerald-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <div className="text-xl text-red-600 font-medium">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-emerald-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation breadcrumb */}
        {isAuthenticated() && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </motion.div>
        )}
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-gray-800">
            🌟 Public Recipes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and explore amazing recipes shared by our talented community of chefs
          </p>
        </motion.div>
        
        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} onViewRecipe={openRecipeModal} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg max-w-md mx-auto"
          >
            <div className="text-6xl mb-6">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No recipes available yet!</h3>
            <p className="text-gray-600 mb-8">
              Be the first to share a recipe with the community!
            </p>
            {isAuthenticated() && (
              <Link
                to="/create-recipe"
                className="inline-block bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
              >
                Create First Recipe ✨
              </Link>
            )}
          </motion.div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isOpen={isModalOpen}
        onClose={closeRecipeModal}
      />
    </div>
  );
};

export default PublicRecipes; 