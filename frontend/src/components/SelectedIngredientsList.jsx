import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SelectedIngredientsList = ({ ingredients, onRemoveIngredient, onUpdateQuantity }) => {
  if (ingredients.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg font-medium">No ingredients added yet</p>
        <p className="text-gray-400 text-sm mt-1">Search and add ingredients above to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Selected Ingredients</h3>
        <span className="text-sm text-gray-500">{ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {ingredients.map(({ ingredient, quantity }) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          {ingredient.calories_per_unit} cal per {ingredient.unit}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {ingredient.unit}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={quantity}
                        onChange={(e) => onUpdateQuantity(ingredient.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-500">{ingredient.unit}</span>
                    </div>
                  </div>

                  {/* Nutrition Info */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Calories:</span> {Math.round((ingredient.calories_per_unit || 0) * quantity)}
                    </div>
                    <div>
                      <span className="font-medium">Protein:</span> {Math.round(((ingredient.protein_per_unit || 0) * quantity) * 10) / 10}g
                    </div>
                    <div>
                      <span className="font-medium">Fat:</span> {Math.round(((ingredient.fat_per_unit || 0) * quantity) * 10) / 10}g
                    </div>
                    <div>
                      <span className="font-medium">Carbs:</span> {Math.round(((ingredient.carbs_per_unit || 0) * quantity) * 10) / 10}g
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveIngredient(ingredient.id)}
                  className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove ingredient"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Ingredient Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>You can adjust quantities by editing the number field</li>
                <li>Nutrition values are calculated automatically based on quantity</li>
                <li>Click the trash icon to remove an ingredient</li>
                <li>All quantities will be converted to per-serving amounts in the final recipe</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedIngredientsList; 