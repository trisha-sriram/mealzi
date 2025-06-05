// src/pages/RecipeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import RecipeDetailModal from '../components/RecipeDetailModal';

const API_BASE_URL = apiService.baseURL;

function RecipeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRecipes, setUserRecipes] = useState([]);
  const [recipeOfTheDay, setRecipeOfTheDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [floatingElements, setFloatingElements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // Subtle floating elements animation
  useEffect(() => {
    const elements = ['🌿', '🍃', '✨', '🌱', '💚'];
    const newFloatingElements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      element: elements[Math.floor(Math.random() * elements.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3
    }));
    setFloatingElements(newFloatingElements);
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [user]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      console.log('Loading recipes...');
      // First, get user recipes
      const userResponse = await apiService.getUserRecipes().catch((error) => {
        console.error('Error loading user recipes:', error);
        return { success: false, recipes: [] };
      });
      
      console.log('User recipes response:', userResponse);
      
      // Set user recipes directly from the response
      setUserRecipes(userResponse.recipes || []);
      
      // Always pick recipeOfTheDay from the latest userRecipes
      const allRecipes = userResponse.recipes || [];
      if (allRecipes.length > 0) {
        const randomRecipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
        setRecipeOfTheDay(randomRecipe);
      } else {
        setRecipeOfTheDay(null);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecipe = () => {
    navigate('/create-recipe');
  };

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
    loadRecipes();
    // recipeOfTheDay will be updated in loadRecipes
  };

  const RecipeCard = ({ recipe, isUserRecipe = false, isRecipeOfDay = false, onViewRecipe }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border ${
        isRecipeOfDay ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-gray-100 hover:border-emerald-200'
      } transition-all duration-300 relative group`}
    >
      {isRecipeOfDay && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 -right-2 z-10 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
        >
          ⭐ Recipe of the Day
        </motion.div>
      )}
      
      <div className="relative h-48 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 overflow-hidden">
        {/* Recipe Image */}
        {recipe.image && (
          <img
            src={`${API_BASE_URL}/uploads/${recipe.image}`}
            alt={recipe.name}
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ opacity: 0.7 }}
          />
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-4 right-4 text-2xl opacity-80"
        >
          🍽️
        </motion.div>
        
        <div className="absolute top-4 left-4">
          <span className="bg-white bg-opacity-95 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            {recipe.type}
          </span>
        </div>
        
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1 drop-shadow-sm">{recipe.name}</h3>
          <p className="text-sm opacity-90">
            {isUserRecipe ? 'By You' : `By ${recipe.author_name || 'Unknown Chef'}`}
          </p>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{recipe.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
              👥 {recipe.servings} servings
            </span>
            <span className="flex items-center bg-emerald-50 px-2 py-1 rounded-lg text-emerald-700">
              🔥 {Math.round((recipe.total_calories || 0) / (recipe.servings || 1))} cal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{Math.round((recipe.total_protein || 0) / (recipe.servings || 1))}g</div>
            <div className="text-xs text-blue-500">Protein</div>
          </div>
          <div className="text-center p-2 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-600">{Math.round((recipe.total_carbs || 0) / (recipe.servings || 1))}g</div>
            <div className="text-xs text-emerald-500">Carbs</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <div className="text-lg font-bold text-amber-600">{Math.round((recipe.total_fat || 0) / (recipe.servings || 1))}g</div>
            <div className="text-xs text-amber-500">Fat</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewRecipe(recipe.id)}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm"
        >
          View Recipe
        </motion.button>
      </div>
    </motion.div>
  );

  const StatsCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-lg relative overflow-hidden`}
    >
      <div className="absolute top-2 right-2 text-3xl opacity-30">{icon}</div>
      <div className="relative z-10">
        <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-white/80 text-xs">{subtitle}</p>}
      </div>
    </motion.div>
  );

  if (isLoading) {
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
          <p className="text-xl text-emerald-800 font-medium">Loading your culinary dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRecipes = userRecipes.length;
  const totalCalories = userRecipes.reduce((sum, recipe) => sum + (recipe.total_calories || 0), 0);
  const avgCaloriesPerRecipe = totalRecipes > 0 ? Math.round(totalCalories / totalRecipes) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-emerald-100 pt-20 relative">
      {/* Subtle floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            initial={{ 
              x: `${element.x}vw`, 
              y: `${element.y}vh`,
              opacity: 0
            }}
            animate={{ 
              y: [`${element.y}vh`, `${element.y - 10}vh`, `${element.y}vh`],
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute text-2xl"
            style={{ left: `${element.x}%`, top: `${element.y}%` }}
          >
            {element.element}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">
              Welcome back, {user?.first_name || 'Chef'}! 👨‍🍳
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Your culinary journey continues here. Create, discover, and share amazing recipes with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateRecipe}
                className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all duration-200 shadow-lg"
              >
                ✨ Create New Recipe
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/recipes')}
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-200"
              >
                🌟 Public Recipes
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Recipe of the Day */}
        {recipeOfTheDay && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-emerald-800">
              ⭐ Recipe of the Day
            </h2>
            <div className="max-w-md mx-auto">
              <RecipeCard recipe={recipeOfTheDay} isRecipeOfDay={true} onViewRecipe={openRecipeModal} />
            </div>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <StatsCard
            title="Your Recipes"
            value={totalRecipes}
            icon="📚"
            color="from-emerald-500 to-teal-600"
            subtitle="recipes created"
          />
          <StatsCard
            title="Total Calories"
            value={totalCalories.toLocaleString()}
            icon="🔥"
            color="from-green-500 to-emerald-600"
            subtitle="across all recipes"
          />
          <StatsCard
            title="Avg per Recipe"
            value={avgCaloriesPerRecipe}
            icon="⚡"
            color="from-teal-500 to-green-600"
            subtitle="calories per recipe"
          />
        </motion.div>

        {/* Your Recipe Collection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-emerald-800">Your Recipe Collection</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRecipe}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-all duration-200 shadow-sm"
            >
              + Add Recipe
            </motion.button>
          </div>

          {userRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RecipeCard recipe={recipe} isUserRecipe={true} onViewRecipe={openRecipeModal} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-sm"
            >
              <div className="text-6xl mb-6">🍳</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No recipes yet!</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your culinary journey by creating your first recipe. Share your favorite dishes with the world!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateRecipe}
                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all duration-200 shadow-lg"
              >
                Create Your First Recipe ✨
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isOpen={isModalOpen}
        onClose={closeRecipeModal}
        currentUser={user}
        onRecipeDeleted={handleRecipeDeleted}
      />
    </div>
  );
}

export default RecipeDashboard;