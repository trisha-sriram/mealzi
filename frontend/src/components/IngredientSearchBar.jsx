import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const IngredientSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchAll, setMatchAll] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Search for ingredients when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await apiService.searchIngredients(searchTerm, 1, 5);
        // Filter out already selected ingredients
        const filteredResults = (response.ingredients || []).filter(
          ingredient => !selectedIngredients.some(selected => selected.id === ingredient.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching ingredients:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedIngredients]);

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredients([...selectedIngredients, ingredient]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(ingredient => ingredient.id !== ingredientId));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedIngredients.length === 0) {
      // If no ingredients selected, notify user or do nothing
      return;
    }
    
    // Search by ingredients
    const ingredientIds = selectedIngredients.map(ingredient => ingredient.id);
    onSearch({
      ingredientIds,
      matchAll
    });
  };

  const handleClear = () => {
    setSelectedIngredients([]);
    setMatchAll(false);
    onSearch({ ingredientIds: [] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-5 mb-8"
    >
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="text-xl font-bold text-emerald-700 mb-2">Find Recipes by Ingredients</div>
        
        {/* Selected Ingredients */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Selected Ingredients</label>
          <div className="flex flex-wrap gap-2 min-h-10 p-2 border border-gray-300 rounded-lg bg-gray-50">
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map(ingredient => (
                <span 
                  key={ingredient.id}
                  className="inline-flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                >
                  {ingredient.name}
                  <button 
                    type="button"
                    onClick={() => handleRemoveIngredient(ingredient.id)}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No ingredients selected. Add some ingredients to search recipes.</span>
            )}
          </div>
        </div>
        
        {/* Ingredient Search Input */}
        <div className="mb-4">
          <label htmlFor="ingredientSearch" className="block text-sm font-medium text-gray-700 mb-1">Add Ingredients</label>
          <div className="relative">
            <input
              type="text"
              id="ingredientSearch"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search ingredients..."
              className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
            {isLoading && (
              <div className="absolute right-3 top-3">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            
            {/* Dropdown Results */}
            <AnimatePresence>
              {searchTerm && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  <ul className="py-1">
                    {searchResults.map(ingredient => (
                      <li 
                        key={ingredient.id}
                        className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-gray-700 text-sm"
                        onClick={() => handleSelectIngredient(ingredient)}
                      >
                        <div className="font-medium">{ingredient.name}</div>
                        <div className="text-xs text-gray-500">{ingredient.unit} • {ingredient.calories_per_unit} cal/{ingredient.unit}</div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Match Option */}
        <div className="flex items-center mb-4">
          <input
            id="matchAll"
            type="checkbox"
            checked={matchAll}
            onChange={(e) => setMatchAll(e.target.checked)}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="matchAll" className="ml-2 block text-sm text-gray-700">
            Match all ingredients (instead of any)
          </label>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={selectedIngredients.length === 0}
            className={`flex-1 py-3 px-6 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              selectedIngredients.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
            }`}
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

export default IngredientSearchBar; 