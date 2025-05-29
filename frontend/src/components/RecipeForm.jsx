// src/components/RecipeForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Assume these API functions are defined elsewhere or replace with actual calls
const searchIngredientsAPI = async (searchTerm) => {
  console.log(`Searching for ingredient: ${searchTerm}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  const mockIngredients = [
    { id: '1', name: 'Chicken Breast', unit: 'piece', calories_per_unit: 165 },
    { id: '2', name: 'Tomato', unit: 'piece', calories_per_unit: 22 },
    { id: '3', name: 'Olive Oil', unit: 'tbsp', calories_per_unit: 119 },
  ];
  if (!searchTerm) return [];
  return mockIngredients.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
};

const createIngredientAPI = async (ingredientData) => {
  console.log('Creating new ingredient (mock):', ingredientData);
  await new Promise(resolve => setTimeout(resolve, 700));
  return { id: `new_${Date.now().toString()}`, ...ingredientData };
};

const createRecipeAPI = async (recipePayload) => {
  console.log('Submitting recipe to backend (mock):', recipePayload);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, recipeId: `mock_recipe_${Date.now()}`, message: `Recipe "${recipePayload.name}" created successfully!` };
};

const INGREDIENT_UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'piece', 'bunch','stick', 'slice', 'pinch', 'clove', 'can','jar', 'pack', 'sheet', 'head', 'leaf', 'filet', 'sprig'];
const RECIPE_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'];

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


function RecipeForm({ showModal, onClose }) { 
  const [recipeName, setRecipeName] = useState('');
  const [recipeType, setRecipeType] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [instructionSteps, setInstructionSteps] = useState('');
  const [servings, setServings] = useState(1);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [currentIngredientSearchTerm, setCurrentIngredientSearchTerm] = useState('');
  const [currentIngredientQuantity, setCurrentIngredientQuantity] = useState('');
  const [currentIngredientUnitForRecipe, setCurrentIngredientUnitForRecipe] = useState(INGREDIENT_UNITS[0]);
  const [ingredientSearchResults, setIngredientSearchResults] = useState([]);
  const [isSearchingIngredients, setIsSearchingIngredients] = useState(false);
  const [selectedIngredientForRecipe, setSelectedIngredientForRecipe] = useState(null);
  const [showNewIngredientModal, setShowNewIngredientModal] = useState(false); // Internal modal for new ingredient
  const [newIngredientData, setNewIngredientData] = useState({
    name: '', unit: INGREDIENT_UNITS[0], description: '', calories_per_unit: 0,
    protein_per_unit: 0, fat_per_unit: 0, carbs_per_unit: 0, sugar_per_unit: 0,
    fiber_per_unit: 0, sodium_per_unit: 0,
  });
  const [isSubmittingNewIngredient, setIsSubmittingNewIngredient] = useState(false);
  const [isSubmittingRecipe, setIsSubmittingRecipe] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });
  const searchInputRef = useRef(null);

  // Reset form when modal is closed/reopened
  useEffect(() => {
    if (!showModal) {
        setRecipeName(''); setRecipeType(''); setDescription(''); setImageFile(null);
        setImagePreview(''); setInstructionSteps(''); setServings(1);
        setRecipeIngredients([]); setCurrentIngredientSearchTerm('');
        setSelectedIngredientForRecipe(null); setCurrentIngredientQuantity('');
        setCurrentIngredientUnitForRecipe(INGREDIENT_UNITS[0]);
        setSubmitStatus({ message: '', type: '' });
    }
  }, [showModal]);

  // Debounced search for ingredients 
  useEffect(() => {
    if (currentIngredientSearchTerm.trim() === '' || selectedIngredientForRecipe) {
      setIngredientSearchResults([]); return;
    }
    setIsSearchingIngredients(true);
    const timerId = setTimeout(async () => {
      const results = await searchIngredientsAPI(currentIngredientSearchTerm);
      setIngredientSearchResults(results); setIsSearchingIngredients(false);
    }, 300);
    return () => clearTimeout(timerId);
  }, [currentIngredientSearchTerm, selectedIngredientForRecipe]);

  const handleImageChange = (e) => { 
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null); setImagePreview('');
    }
  };
  const handleSelectSearchedIngredient = (ingredient) => { 
    setSelectedIngredientForRecipe(ingredient); 
    setCurrentIngredientSearchTerm(ingredient.name); 
    setIngredientSearchResults([]); 
    setCurrentIngredientUnitForRecipe(ingredient.unit || INGREDIENT_UNITS[0]);
  };
  const handleAddIngredientToRecipeList = () => { 
    if (!selectedIngredientForRecipe || !currentIngredientQuantity) { alert("Select ingredient and enter quantity."); return; }
    if (recipeIngredients.find(item => item.ingredient.id === selectedIngredientForRecipe.id)) { alert(`${selectedIngredientForRecipe.name} already added.`); return; }
    setRecipeIngredients([...recipeIngredients, { ingredient: selectedIngredientForRecipe, quantity: parseFloat(currentIngredientQuantity), unitForRecipe: currentIngredientUnitForRecipe }]);
    setCurrentIngredientSearchTerm(''); setSelectedIngredientForRecipe(null); setCurrentIngredientQuantity(''); setCurrentIngredientUnitForRecipe(INGREDIENT_UNITS[0]);
    if (searchInputRef.current) searchInputRef.current.focus();
  };
  const handleRemoveIngredientFromRecipeList = (ingredientIdToRemove) => { 
    setRecipeIngredients(recipeIngredients.filter(item => item.ingredient.id !== ingredientIdToRemove));
  };
  const openNewIngredientModal = () => {
    setNewIngredientData(prev => ({ ...prev, name: currentIngredientSearchTerm && !selectedIngredientForRecipe ? currentIngredientSearchTerm : '' }));
    setShowNewIngredientModal(true); // This is the *internal* modal for creating a new ingredient
  };
  const handleNewIngredientChange = (e) => { 
    const { name, value, type } = e.target;
    setNewIngredientData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };
  const handleSaveNewIngredient = async (e) => { 
    e.preventDefault();
    if (!newIngredientData.name || !newIngredientData.unit) { alert("New ingredient name and unit are required."); return; }
    setIsSubmittingNewIngredient(true);
    try {
      const createdIngredient = await createIngredientAPI(newIngredientData);
      if (createdIngredient && createdIngredient.id) {
        alert(`Ingredient "${createdIngredient.name}" created! Search for it to add to recipe.`);
        setShowNewIngredientModal(false); 
        setNewIngredientData({ name: '', unit: INGREDIENT_UNITS[0], description: '', calories_per_unit: 0, protein_per_unit: 0, fat_per_unit: 0, carbs_per_unit: 0, sugar_per_unit: 0, fiber_per_unit: 0, sodium_per_unit: 0 });
        setCurrentIngredientSearchTerm(''); setSelectedIngredientForRecipe(null);
      } else { alert("Failed to create new ingredient (mock)."); }
    } catch (error) { console.error("Error creating ingredient:", error); alert("Error creating ingredient."); }
    setIsSubmittingNewIngredient(false);
  };
  const handleSubmitRecipe = async (e) => { 
    e.preventDefault();
    if (recipeIngredients.length === 0) { setSubmitStatus({ message: 'Please add at least one ingredient.', type: 'error' }); return; }
    setIsSubmittingRecipe(true); setSubmitStatus({ message: '', type: '' });
    const formData = new FormData();
    formData.append('name', recipeName); formData.append('type', recipeType); formData.append('description', description);
    if (imageFile) formData.append('image', imageFile);
    formData.append('instruction_steps', instructionSteps); formData.append('servings', servings.toString());
    const ingredientsPayload = recipeIngredients.map(item => ({ ingredient_id: item.ingredient.id, quantity_per_serving: item.quantity }));
    formData.append('ingredients', JSON.stringify(ingredientsPayload));
    try {
      const payloadForMock = Object.fromEntries(formData); // For mock API
      const result = await createRecipeAPI(payloadForMock);
      if (result.success) {
        setSubmitStatus({ message: result.message || `Recipe "${recipeName}" created!`, type: 'success' });
      } else { setSubmitStatus({ message: result.message || 'Failed to create recipe.', type: 'error' }); }
    } catch (error) { console.error("Error submitting recipe:", error); setSubmitStatus({ message: error.message || 'An error occurred.', type: 'error' }); }
    setIsSubmittingRecipe(false);
  };

  const modalOverlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.4 } },
    exit: { opacity: 0, scale: 0.9, y: 30, transition: { duration: 0.3 } }
  };
  const inputGroupVariants = { /* ... (same as original complex form) ... */ 
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" }, }),
  };


  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} 
        >
          <motion.div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl text-gray-800 overflow-hidden max-h-[95vh] flex flex-col"
            variants={modalContentVariants}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <h2 className="text-xl md:text-2xl font-bold font-cute text-emerald-700">
                  Create New Recipe
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }} aria-label="Close modal"
              >
                <CloseIcon />
              </motion.button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-grow">
              <form onSubmit={handleSubmitRecipe} className="space-y-8">
                {/* Recipe Details Section  */}
                <motion.div custom={0} initial="hidden" animate="visible" variants={inputGroupVariants}>
                  <h3 className="text-lg font-semibold font-cute text-emerald-600 mb-3 border-b border-lime-200 pb-1">Recipe Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="recipeNameModal" className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
                      <input type="text" id="recipeNameModal" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} required className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g., Spicy Tomato Pasta"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="recipeTypeModal" className="block text-sm font-medium text-gray-700 mb-1">Recipe Type</label>
                        <select id="recipeTypeModal" value={recipeType} onChange={(e) => setRecipeType(e.target.value)} required className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                          <option value="" disabled>Select a type</option>
                          {RECIPE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="servingsModal" className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                        <input type="number" id="servingsModal" value={servings} onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))} min="1" required className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="descriptionModal" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea id="descriptionModal" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="A short summary..."></textarea>
                    </div>
                 
                  </div>
                </motion.div>

                {/* Ingredients Section (copied from original complex form) */}
                <motion.div custom={1} initial="hidden" animate="visible" variants={inputGroupVariants}>
                  <h3 className="text-lg font-semibold font-cute text-emerald-600 mb-3 border-b border-lime-200 pb-1">Ingredients</h3>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {recipeIngredients.map((item) => (
                        <motion.div 
                          key={item.ingredient.id || item.ingredient.name} layout
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-md border border-emerald-200 text-sm"
                        >
                          <span className="font-medium text-emerald-800 flex-grow">{item.ingredient.name}</span>
                          <span className="text-gray-700">{item.quantity}</span>
                          <span className="text-gray-600">{item.unitForRecipe}</span>
                          <motion.button type="button" onClick={() => handleRemoveIngredientFromRecipeList(item.ingredient.id || item.ingredient.name)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100" whileTap={{scale:0.9}}>
                            <TrashIcon />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div className="p-3 border border-dashed border-lime-300 rounded-md space-y-2 bg-lime-50/50">
                      <p className="text-xs font-medium text-gray-600">Add an ingredient:</p>
                      <div className="relative">
                          <input type="text" ref={searchInputRef} value={currentIngredientSearchTerm} 
                              onChange={(e) => { setCurrentIngredientSearchTerm(e.target.value); setSelectedIngredientForRecipe(null); }} 
                              placeholder="Ingredient name (e.g., Flour)" 
                              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"/>
                          {isSearchingIngredients && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>}
                          {ingredientSearchResults.length > 0 && (
                              <motion.ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-32 overflow-y-auto shadow-lg" initial={{opacity:0, y: -5}} animate={{opacity:1, y:0}}>
                              {ingredientSearchResults.map(ing => (
                                  <li key={ing.id} onClick={() => handleSelectSearchedIngredient(ing)} className="p-1.5 hover:bg-lime-100 cursor-pointer text-xs">{ing.name} <span className="text-xs text-gray-400">({ing.unit})</span></li>
                              ))}
                              </motion.ul>
                          )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <input type="number" value={currentIngredientQuantity} onChange={(e) => setCurrentIngredientQuantity(e.target.value)} placeholder="Qty" min="0.01" step="0.01" className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"/>
                          <select value={currentIngredientUnitForRecipe} onChange={(e) => setCurrentIngredientUnitForRecipe(e.target.value)} className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm">
                              {INGREDIENT_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                          </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                          <motion.button type="button" onClick={handleAddIngredientToRecipeList}
                              className="flex-1 py-1.5 px-3 bg-emerald-500 text-white rounded-md font-medium hover:bg-emerald-600 text-xs flex items-center justify-center gap-1"
                              whileHover={{scale:1.02}} whileTap={{scale:0.98}} disabled={!selectedIngredientForRecipe || !currentIngredientQuantity}>
                              <PlusIcon /> Add to Recipe
                          </motion.button>
                          {currentIngredientSearchTerm.trim() && !selectedIngredientForRecipe && !ingredientSearchResults.find(r => r.name.toLowerCase() === currentIngredientSearchTerm.toLowerCase()) && (
                              <motion.button type="button" onClick={openNewIngredientModal}
                                  className="flex-1 py-1.5 px-3 bg-lime-500 text-white rounded-md font-medium hover:bg-lime-600 text-xs flex items-center justify-center gap-1"
                                  whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
                                 <PlusIcon /> Create New
                              </motion.button>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Instructions Section */}
                <motion.div custom={2} initial="hidden" animate="visible" variants={inputGroupVariants}>
                  <h3 className="text-lg font-semibold font-cute text-emerald-600 mb-3 border-b border-lime-200 pb-1">Instructions</h3>
                  <div>
                    <label htmlFor="instructionStepsModal" className="block text-sm font-medium text-gray-700 mb-1 sr-only">Steps</label>
                    <textarea id="instructionStepsModal" value={instructionSteps} onChange={(e) => setInstructionSteps(e.target.value)} rows="5" required className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="1. Chop vegetables...&#10;2. Preheat oven..."></textarea>
                  </div>
                </motion.div>

                {submitStatus.message && (
                  <p className={`text-sm ${submitStatus.type === 'error' ? 'text-red-600' : 'text-green-600'} text-center py-1`}>
                    {submitStatus.message}
                  </p>
                )}

                {/* Submit Button (within the scrollable area but before modal footer) */}
                <div className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmittingRecipe}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-md font-medium text-white bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70"
                    whileHover={{ scale: isSubmittingRecipe ? 1 : 1.02, y: isSubmittingRecipe ? 0 : -2 }}
                    whileTap={{ scale: isSubmittingRecipe ? 1 : 0.98 }}
                  >
                    {isSubmittingRecipe ? 'Submitting...' : 'Add Recipe'}
                  </motion.button>
                </div>
              </form>
            </div>
            
            {/* Internal Modal for creating a NEW ingredient (if needed) */}
            <AnimatePresence>
                {showNewIngredientModal && (
                    <motion.div 
                        className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowNewIngredientModal(false)}
                    >
                        <motion.div 
                            className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 space-y-4 overflow-y-auto max-h-[80vh]"
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-emerald-700">Create New Ingredient</h3>
                            <form onSubmit={handleSaveNewIngredient} className="space-y-3 text-sm">
                                <div>
                                    <label htmlFor="newIngName" className="block text-xs font-medium text-gray-600">Name</label>
                                    <input type="text" id="newIngName" name="name" value={newIngredientData.name} onChange={handleNewIngredientChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500"/>
                                </div>
                                <div>
                                    <label htmlFor="newIngUnit" className="block text-xs font-medium text-gray-600">Default Unit</label>
                                    <select id="newIngUnit" name="unit" value={newIngredientData.unit} onChange={handleNewIngredientChange} required className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-emerald-500">
                                        {INGREDIENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="newIngDesc" className="block text-xs font-medium text-gray-600">Description</label>
                                    <textarea id="newIngDesc" name="description" value={newIngredientData.description} onChange={handleNewIngredientChange} rows="2" className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="newIngCals" className="block text-xs font-medium text-gray-600">Calories per Unit</label>
                                    <input type="number" id="newIngCals" name="calories_per_unit" value={newIngredientData.calories_per_unit} onChange={handleNewIngredientChange} min="0" step="0.1" className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500"/>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <motion.button type="button" onClick={() => setShowNewIngredientModal(false)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50" whileTap={{scale:0.95}}>Cancel</motion.button>
                                    <motion.button type="submit" disabled={isSubmittingNewIngredient} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50" whileTap={{scale:0.95}}>
                                        {isSubmittingNewIngredient ? "Saving..." : "Save Ingredient"}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RecipeForm; 
