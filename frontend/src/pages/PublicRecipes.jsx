import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import RecipeDetailModal from '../components/RecipeDetailModal';
import IngredientSearchBar from '../components/IngredientSearchBar';

// API calls use /CustomRecipeManager, but frontend routes use /CustomRecipeManager/static
const API_BASE_URL = '/CustomRecipeManager';

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
  const navigate = useNavigate();
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleImageError = () => {
    setImageError(true);
  };

  const copyShareLink = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/CustomRecipeManager/static/recipe/${recipe.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      // You could add a toast notification here
      alert('Recipe link copied to clipboard!');
    });
  };

  const openShareableRecipe = (e) => {
    e.stopPropagation();
    navigate(`/recipe/${recipe.id}`);
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
            src={recipe.image.startsWith('http') ? recipe.image : `/CustomRecipeManager/uploads/${recipe.image}`}
            alt={recipe.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              console.error('Image failed to load:', {
                src: e.target.src,
                recipe: recipe.name,
                image: recipe.image,
                isMealDB: recipe.image.startsWith('http')
              });
              handleImageError();
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', {
                src: recipe.image.startsWith('http') ? recipe.image : `/CustomRecipeManager/uploads/${recipe.image}`,
                recipe: recipe.name,
                isMealDB: recipe.image.startsWith('http')
              });
            }}
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
        {(recipe.total_calories !== undefined || recipe.total_protein !== undefined || recipe.total_carbs !== undefined || recipe.total_fat !== undefined) && (
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

// New SearchBar component
const SearchBar = ({ onSearch }) => {
  const [nameQuery, setNameQuery] = useState('');
  const [typeQuery, setTypeQuery] = useState('');
  const recipeTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'];
  
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(nameQuery, typeQuery);
  };
  
  const handleClear = () => {
    setNameQuery('');
    setTypeQuery('');
    onSearch('', '');
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-5 mb-8"
    >
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="text-xl font-bold text-emerald-700 mb-2">Find Your Perfect Recipe</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recipe Name Search */}
          <div className="col-span-2">
            <label htmlFor="nameSearch" className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                id="nameSearch"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Search by recipe name..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          
          {/* Recipe Type Filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Recipe Type</label>
            <select
              id="typeFilter"
              value={typeQuery}
              onChange={(e) => setTypeQuery(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Types</option>
              {recipeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            Search Recipes
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleClear}
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
          >
            Clear
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

const PublicRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Search state
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'ingredients'
  const [nameQuery, setNameQuery] = useState('');
  const [typeQuery, setTypeQuery] = useState('');
  const [ingredientIds, setIngredientIds] = useState([]);
  const [matchAll, setMatchAll] = useState(false);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [searchSummary, setSearchSummary] = useState('');

  const openRecipeModal = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setIsModalOpen(true);
  };

  const closeRecipeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipeId(null);
  };

  const handleRecipeDeleted = () => {
    closeRecipeModal();
    // Optionally refresh public recipes if you want to remove deleted ones
    fetchBasicRecipes();
  };

  const handleBasicSearch = (name, type) => {
    setNameQuery(name);
    setTypeQuery(type);
    setIngredientIds([]);
    setMatchAll(false);
    fetchBasicRecipes(name, type);
    
    // Update search summary
    let summary = '';
    if (name) summary += `name containing "${name}"`;
    if (type) summary += `${summary ? ' and ' : ''}type "${type}"`;
    setSearchSummary(summary);
  };
  
  const handleIngredientSearch = ({ ingredientIds = [], matchAll = false }) => {
    setIngredientIds(ingredientIds);
    setMatchAll(matchAll);
    setNameQuery('');
    setTypeQuery('');
    
    if (ingredientIds.length === 0) {
      // If no ingredients, just reset to all recipes
      fetchBasicRecipes('', '');
      setSearchSummary('');
    } else {
      // Search by ingredients
      fetchRecipesByIngredients(ingredientIds, matchAll, '', '');
      
      // Update search summary
      const summary = `${ingredientIds.length} ingredient${ingredientIds.length > 1 ? 's' : ''} (${matchAll ? 'all' : 'any'})`;
      setSearchSummary(summary);
    }
  };
  
  const fetchBasicRecipes = async (name = nameQuery, type = typeQuery) => {
    setLoading(true);
    try {
      // Always use the public recipes endpoint for simplicity
      let response;
      if (!name && !type) {
        response = await apiService.getPublicRecipes();
        setTotalRecipes(response.recipes?.length || 0);
        setRecipes(response.recipes || []);
      } else {
        // Use search endpoint but get all results
        response = await apiService.searchRecipes(name, type, 1, 100);
        setTotalRecipes(response.total || 0);
        setRecipes(response.recipes || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes. Please try again later.');
      setLoading(false);
    }
  };
  
  const fetchRecipesByIngredients = async (
    ingredients = ingredientIds,
    match = matchAll,
    name = nameQuery,
    type = typeQuery
  ) => {
    setLoading(true);
    try {
      const response = await apiService.searchRecipesByIngredients(
        ingredients, match, name, type, 1, 100
      );
      setTotalRecipes(response.total || 0);
      setRecipes(response.recipes || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipes by ingredients:', err);
      setError('Failed to fetch recipes. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    if (ingredientIds.length > 0) {
      fetchRecipesByIngredients();
    } else {
      fetchBasicRecipes();
    }
  }, []); // Remove pagination dependencies

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset search parameters when switching tabs
    if (tab === 'basic') {
      setIngredientIds([]);
      setMatchAll(false);
    }
  };

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
              className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
            >
              ← Back to Dashboard
            </Link>
          </motion.div>
        )}
        
        {/* Page Header */}
        <div className="mb-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-emerald-800 mb-2"
          >
            Discover Recipes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-emerald-600"
          >
            Explore our collection of delicious recipes shared by our community
          </motion.p>
        </div>
        
        {/* Search Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => handleTabChange('basic')}
              className={`py-3 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'basic'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Search by Name/Type
            </button>
            <button
              onClick={() => handleTabChange('ingredients')}
              className={`py-3 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'ingredients'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Search by Ingredients
            </button>
          </div>
          
          {/* Search Components */}
          {activeTab === 'basic' ? (
            <SearchBar onSearch={handleBasicSearch} />
          ) : (
            <IngredientSearchBar onSearch={handleIngredientSearch} />
          )}
        </div>
        
        {/* Search Results Summary */}
        {searchSummary && (
          <div className="mb-6 bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">
                  {totalRecipes} {totalRecipes === 1 ? 'recipe' : 'recipes'} found
                </span>
                {searchSummary && <span className="ml-2">matching {searchSummary}</span>}
              </div>
              <button 
                onClick={() => activeTab === 'basic' ? handleBasicSearch('', '') : handleIngredientSearch({})}
                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
        
        {/* Recipe Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                index={index} 
                onViewRecipe={openRecipeModal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-600">
              {searchSummary
                ? 'Try adjusting your search criteria'
                : 'Be the first to add a recipe to our collection!'}
            </p>
            {isAuthenticated() && (
              <Link
                to="/create-recipe"
                className="inline-block mt-6 bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-all duration-200"
              >
                Create a Recipe
              </Link>
            )}
          </div>
        )}
      </div>
      
      {/* Recipe Detail Modal */}
      {isModalOpen && selectedRecipeId && (
        <RecipeDetailModal
          recipeId={selectedRecipeId}
          isOpen={isModalOpen}
          onClose={closeRecipeModal}
          currentUser={user}
          onRecipeDeleted={handleRecipeDeleted}
        />
      )}
    </div>
  );
};

export default PublicRecipes; 