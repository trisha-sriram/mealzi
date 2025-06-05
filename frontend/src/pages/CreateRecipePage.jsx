import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecipeDetailsSection from '../components/RecipeDetailsSection';
import InstructionsSection from '../components/InstructionsSection';
import IngredientSearchInput from '../components/IngredientSearchInput';
import SelectedIngredientsList from '../components/SelectedIngredientsList';
import NutritionSummary from '../components/NutritionSummary';
import apiService from '../services/api';

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });

  // Recipe form state
  const [recipeData, setRecipeData] = useState({
    name: '',
    type: 'Dinner',
    description: '',
    servings: 4,
    images: [],
  });

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [instructionSteps, setInstructionSteps] = useState(['']);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editRecipeId, setEditRecipeId] = useState(null);

  // Add state for existing and new images
  const [existingImages, setExistingImages] = useState([]); // URLs/filenames from backend
  const [newImages, setNewImages] = useState([]); // File objects

  const steps = [
    { id: 'details', title: 'Recipe Details', icon: '📝' },
    { id: 'ingredients', title: 'Ingredients', icon: '🥕' },
    { id: 'instructions', title: 'Instructions', icon: '👨‍🍳' },
    { id: 'review', title: 'Review & Create', icon: '✅' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditRecipeId(editId);
      // Fetch recipe and prefill
      apiService.getRecipeDetail(editId).then(res => {
        if (res.success) {
          const r = res.recipe;
          setRecipeData({
            name: r.name,
            type: r.type,
            description: r.description,
            servings: r.servings,
            images: [], // Not used for edit mode
          });
          setExistingImages([r.image, ...(r.images || [])].filter(Boolean));
          // Robustly parse instructions
          let steps = r.instruction_steps;
          if (typeof steps === 'string') {
            try {
              const parsed = JSON.parse(steps);
              if (Array.isArray(parsed)) {
                steps = parsed;
              } else if (typeof parsed === 'string') {
                steps = [parsed];
              } else {
                steps = [steps];
              }
            } catch {
              // If it's a string like "['eat']", remove brackets and quotes
              if (/^\[.*\]$/.test(steps)) {
                steps = steps.replace(/^\[|\]$/g, '').split(',').map(s => s.replace(/['"]/g, '').trim()).filter(Boolean);
              } else {
                steps = [steps];
              }
            }
          }
          setInstructionSteps(Array.isArray(steps) ? steps : [steps]);
          setSelectedIngredients((r.ingredients || []).map(ing => ({ ingredient: ing, quantity: ing.quantity_per_serving })));
        }
      });
    } else {
      setIsEditMode(false);
      setEditRecipeId(null);
      setRecipeData({
        name: '',
        type: 'Dinner',
        description: '',
        servings: 4,
        images: [],
      });
      setInstructionSteps(['']);
      setSelectedIngredients([]);
      setExistingImages([]);
      setNewImages([]);
    }
  }, [location.search]);

  const updateRecipeData = (field, value) => {
    setRecipeData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = (ingredient, quantity) => {
    const existingIndex = selectedIngredients.findIndex(
      item => item.ingredient.id === ingredient.id
    );

    if (existingIndex >= 0) {
      // Update existing ingredient
      const updated = [...selectedIngredients];
      updated[existingIndex] = { ingredient, quantity };
      setSelectedIngredients(updated);
    } else {
      // Add new ingredient
      setSelectedIngredients(prev => [...prev, { ingredient, quantity }]);
    }
  };

  const removeIngredient = (ingredientId) => {
    setSelectedIngredients(prev => 
      prev.filter(item => item.ingredient.id !== ingredientId)
    );
  };

  const updateIngredientQuantity = (ingredientId, newQuantity) => {
    setSelectedIngredients(prev =>
      prev.map(item =>
        item.ingredient.id === ingredientId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const addInstructionStep = () => {
    setInstructionSteps(prev => [...prev, '']);
  };

  const updateInstructionStep = (index, value) => {
    setInstructionSteps(prev =>
      prev.map((step, i) => (i === index ? value : step))
    );
  };

  const removeInstructionStep = (index) => {
    if (instructionSteps.length > 1) {
      setInstructionSteps(prev => prev.filter((_, i) => i !== index));
    }
  };

  const moveInstructionStep = (fromIndex, toIndex) => {
    const newSteps = [...instructionSteps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);
    setInstructionSteps(newSteps);
  };

  const calculateNutrition = () => {
    const totals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      sodium: 0,
    };

    selectedIngredients.forEach(({ ingredient, quantity }) => {
      totals.calories += (ingredient.calories_per_unit || 0) * quantity;
      totals.protein += (ingredient.protein_per_unit || 0) * quantity;
      totals.fat += (ingredient.fat_per_unit || 0) * quantity;
      totals.carbs += (ingredient.carbs_per_unit || 0) * quantity;
      totals.sugar += (ingredient.sugar_per_unit || 0) * quantity;
      totals.fiber += (ingredient.fiber_per_unit || 0) * quantity;
      totals.sodium += (ingredient.sodium_per_unit || 0) * quantity;
    });

    // Calculate per serving
    const servings = recipeData.servings || 1;
    return {
      total: totals,
      perServing: {
        calories: Math.round(totals.calories / servings),
        protein: Math.round((totals.protein / servings) * 10) / 10,
        fat: Math.round((totals.fat / servings) * 10) / 10,
        carbs: Math.round((totals.carbs / servings) * 10) / 10,
        sugar: Math.round((totals.sugar / servings) * 10) / 10,
        fiber: Math.round((totals.fiber / servings) * 10) / 10,
        sodium: Math.round(totals.sodium / servings),
      },
    };
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Details
        return recipeData.name.trim() && recipeData.type && recipeData.description.trim();
      case 1: // Ingredients
        return true; // Allow skipping ingredients section
      case 2: // Instructions
        return instructionSteps.some(step => step.trim());
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Update image handlers
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewImages(prev => [...prev, ...files]);
    }
  };
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setSubmitMessage({ text: 'Please complete all required fields', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ text: '', type: '' });

    try {
      let formData = new FormData();
      formData.append('name', recipeData.name);
      formData.append('type', recipeData.type);
      formData.append('description', recipeData.description);
      formData.append('servings', recipeData.servings);
      formData.append('instruction_steps', JSON.stringify(instructionSteps.filter(step => step.trim())));
      formData.append('ingredients', JSON.stringify(selectedIngredients.map(item => ({
        id: item.ingredient.id,
        quantity_per_serving: item.quantity
      }))));
      // Existing images to keep
      formData.append('existing_images', JSON.stringify(existingImages));
      // New images to upload
      newImages.forEach(img => formData.append('images', img, img.name));

      console.log('Submitting form data:', {
        name: recipeData.name,
        type: recipeData.type,
        description: recipeData.description,
        servings: recipeData.servings,
        instruction_steps: instructionSteps.filter(step => step.trim()),
        ingredients: selectedIngredients.length,
        images: newImages.length
      });

      if (isEditMode && editRecipeId) {
        await apiService.updateRecipe(editRecipeId, formData, true);
        setSubmitMessage({ text: 'Recipe updated successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        await apiService.createRecipe(formData);
        setSubmitMessage({ text: 'Recipe created successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      setSubmitMessage({ text: error.message || 'An error occurred', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <RecipeDetailsSection
            key={`details-${isEditMode ? editRecipeId : 'new'}`}
            recipeData={recipeData}
            updateRecipeData={updateRecipeData}
            existingImages={existingImages}
            newImages={newImages}
            onImageChange={handleImageChange}
            onRemoveExistingImage={removeExistingImage}
            onRemoveNewImage={removeNewImage}
          />
        );
      case 1:
        return (
          <div className="space-y-6" key={`ingredients-${isEditMode ? editRecipeId : 'new'}`}>
            <IngredientSearchInput onAddIngredient={addIngredient} />
            <SelectedIngredientsList
              ingredients={selectedIngredients}
              onRemoveIngredient={removeIngredient}
              onUpdateQuantity={updateIngredientQuantity}
            />
          </div>
        );
      case 2:
        return (
          <InstructionsSection
            key={`instructions-${isEditMode ? editRecipeId : 'new'}`}
            steps={instructionSteps}
            onAddStep={addInstructionStep}
            onUpdateStep={updateInstructionStep}
            onRemoveStep={removeInstructionStep}
            onMoveStep={moveInstructionStep}
          />
        );
      case 3:
        return (
          <div className="space-y-6" key={`review-${isEditMode ? editRecipeId : 'new'}`}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Recipe Summary</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div>
                    <p><strong>Name:</strong> {recipeData.name}</p>
                    <p><strong>Type:</strong> {recipeData.type}</p>
                    <p><strong>Servings:</strong> {recipeData.servings}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 bg-white p-3 rounded-md border border-gray-200">
                      {recipeData.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      {selectedIngredients.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                          {selectedIngredients.map((item, idx) => {
                            const calories = (item.ingredient.calories_per_unit || 0) * (item.quantity || 0);
                            return (
                              <li key={item.ingredient.id} className="flex items-center py-2">
                                <span className="flex-1">{item.ingredient.name}</span>
                                <span className="w-20 text-sm text-black font-normal text-right">{item.quantity} {item.ingredient.unit}</span>
                                <span className="w-16 ml-4 text-sm text-yellow-800 font-normal text-right">{calories} kcal</span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No ingredients added</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      {instructionSteps.filter(step => step.trim()).length > 0 ? (
                        <ol className="list-decimal list-inside space-y-2">
                          {instructionSteps
                            .filter(step => step.trim())
                            .map((step, index) => (
                              <li key={index} className="text-gray-700">
                                {step}
                              </li>
                            ))}
                        </ol>
                      ) : (
                        <p className="text-gray-500 italic">No instructions added</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <NutritionSummary nutrition={calculateNutrition()} />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
          <p className="text-gray-600">Share your culinary creation with the world</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Submit Message */}
        {submitMessage.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className={`px-6 py-2 rounded-lg font-medium ${
                validateCurrentStep()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateCurrentStep()}
              className={`px-6 py-2 rounded-lg font-medium ${
                isSubmitting || !validateCurrentStep()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Creating Recipe...' : 'Create Recipe'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateRecipePage; 