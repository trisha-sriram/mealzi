import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const IngredientSearchInput = ({ onAddIngredient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    unit: 'g',
    description: '',
    calories_per_unit: '',
    protein_per_unit: '',
    fat_per_unit: '',
    carbs_per_unit: '',
    sugar_per_unit: '',
    fiber_per_unit: '',
    sodium_per_unit: '',
  });
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
  const searchInputRef = useRef(null);

  const INGREDIENT_UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'piece', 'bunch', 'stick', 'slice', 'pinch', 'clove', 'can', 'jar', 'pack', 'sheet', 'head', 'leaf', 'filet', 'sprig'];

  // Debounced search
  useEffect(() => {
    if (searchTerm.trim() === '' || selectedIngredient) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await apiService.searchIngredients(searchTerm, 1, 10);
        setSearchResults(response.ingredients || []);
      } catch (error) {
        console.error('Error searching ingredients:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedIngredient]);

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    setSearchResults([]);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient || !quantity || parseFloat(quantity) <= 0) {
      alert('Please select an ingredient and enter a valid quantity.');
      return;
    }

    onAddIngredient(selectedIngredient, parseFloat(quantity));
    
    // Reset form
    setSelectedIngredient(null);
    setSearchTerm('');
    setQuantity('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCreateNewIngredient = () => {
    setNewIngredientData(prev => ({
      ...prev,
      name: searchTerm && !selectedIngredient ? searchTerm : ''
    }));
    setShowCreateModal(true);
  };

  const handleSaveNewIngredient = async () => {
    if (!newIngredientData.name || !newIngredientData.unit || !newIngredientData.calories_per_unit) {
      alert('Please fill in name, unit, and calories per unit.');
      return;
    }

    setIsCreatingIngredient(true);
    try {
      const response = await apiService.createIngredient({
        ...newIngredientData,
        calories_per_unit: parseFloat(newIngredientData.calories_per_unit) || 0,
        protein_per_unit: parseFloat(newIngredientData.protein_per_unit) || 0,
        fat_per_unit: parseFloat(newIngredientData.fat_per_unit) || 0,
        carbs_per_unit: parseFloat(newIngredientData.carbs_per_unit) || 0,
        sugar_per_unit: parseFloat(newIngredientData.sugar_per_unit) || 0,
        fiber_per_unit: parseFloat(newIngredientData.fiber_per_unit) || 0,
        sodium_per_unit: parseFloat(newIngredientData.sodium_per_unit) || 0,
      });

      if (response.success) {
        alert(`Ingredient "${response.ingredient.name}" created successfully!`);
        setShowCreateModal(false);
        setNewIngredientData({
          name: '',
          unit: 'g',
          description: '',
          calories_per_unit: '',
          protein_per_unit: '',
          fat_per_unit: '',
          carbs_per_unit: '',
          sugar_per_unit: '',
          fiber_per_unit: '',
          sodium_per_unit: '',
        });
        setSearchTerm('');
        setSelectedIngredient(null);
      }
    } catch (error) {
      alert(error.message || 'Failed to create ingredient');
    } finally {
      setIsCreatingIngredient(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Ingredients</h2>
        <p className="text-gray-600 mb-6">
          Search for ingredients and specify quantities for your recipe.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ingredient Search */}
          <div className="md:col-span-2 relative">
            <label htmlFor="ingredient-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Ingredient
            </label>
            <input
              ref={searchInputRef}
              type="text"
              id="ingredient-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIngredient(null);
              }}
              placeholder="Type to search for ingredients..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {!selectedIngredient && (searchResults.length > 0 || (searchTerm && !isSearching && searchResults.length === 0)) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        onClick={() => handleSelectIngredient(ingredient)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{ingredient.name}</p>
                            <p className="text-sm text-gray-500">
                              {ingredient.calories_per_unit} cal per {ingredient.unit}
                            </p>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {ingredient.unit}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4">
                      <p className="text-gray-500 mb-2">No ingredients found for "{searchTerm}"</p>
                      <button
                        onClick={handleCreateNewIngredient}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Create new ingredient
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quantity Input */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex">
              <input
                type="number"
                id="quantity"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                {selectedIngredient?.unit || 'unit'}
              </span>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddIngredient}
            disabled={!selectedIngredient || !quantity || parseFloat(quantity) <= 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              selectedIngredient && quantity && parseFloat(quantity) > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Create New Ingredient Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Ingredient</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newIngredientData.name}
                        onChange={(e) => setNewIngredientData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                      <select
                        value={newIngredientData.unit}
                        onChange={(e) => setNewIngredientData(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {INGREDIENT_UNITS.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newIngredientData.description}
                      onChange={(e) => setNewIngredientData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calories per unit *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newIngredientData.calories_per_unit}
                        onChange={(e) => setNewIngredientData(prev => ({ ...prev, calories_per_unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Protein per unit</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newIngredientData.protein_per_unit}
                        onChange={(e) => setNewIngredientData(prev => ({ ...prev, protein_per_unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fat per unit</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newIngredientData.fat_per_unit}
                        onChange={(e) => setNewIngredientData(prev => ({ ...prev, fat_per_unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Carbs per unit</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newIngredientData.carbs_per_unit}
                        onChange={(e) => setNewIngredientData(prev => ({ ...prev, carbs_per_unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewIngredient}
                    disabled={isCreatingIngredient}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isCreatingIngredient
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isCreatingIngredient ? 'Creating...' : 'Create Ingredient'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IngredientSearchInput; 