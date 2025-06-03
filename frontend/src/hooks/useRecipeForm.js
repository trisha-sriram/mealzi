import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

export const useRecipeForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recipeData, setRecipeData] = useState({
    name: '',
    type: 'Breakfast', // Default value
    description: '',
    servings: 1,
    instruction_steps: [],
    ingredients: [],
    images: [] // Changed from image to images array
  });

  const updateRecipeData = (field, value) => {
    setRecipeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addIngredient = (ingredient, quantity, unit) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredient_id: ingredient.id,
          name: ingredient.name, // For display purposes
          quantity_per_serving: quantity,
          unit: unit
        }
      ]
    }));
  };

  const removeIngredient = (ingredientId) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.ingredient_id !== ingredientId)
    }));
  };

  const addInstructionStep = (step) => {
    setRecipeData(prev => ({
      ...prev,
      instruction_steps: [...prev.instruction_steps, step]
    }));
  };

  const updateInstructionStep = (index, newStep) => {
    setRecipeData(prev => ({
      ...prev,
      instruction_steps: prev.instruction_steps.map((step, i) => 
        i === index ? newStep : step
      )
    }));
  };

  const removeInstructionStep = (index) => {
    setRecipeData(prev => ({
      ...prev,
      instruction_steps: prev.instruction_steps.filter((_, i) => i !== index)
    }));
  };

  const submitRecipe = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['name', 'type', 'description', 'servings'];
      const missingFields = requiredFields.filter(field => !recipeData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (recipeData.ingredients.length === 0) {
        throw new Error('Please add at least one ingredient');
      }

      if (recipeData.instruction_steps.length === 0) {
        throw new Error('Please add at least one instruction step');
      }

      // Format the data for the API
      const formattedData = {
        ...recipeData,
        instruction_steps: recipeData.instruction_steps.join('\n'),
        ingredients: recipeData.ingredients.map(({ ingredient_id, quantity_per_serving }) => ({
          ingredient_id,
          quantity_per_serving
        }))
      };

      const response = await apiService.createRecipe(formattedData);
      
      if (response.success) {
        navigate('/dashboard');
        return response;
      } else {
        throw new Error(response.error || 'Failed to create recipe');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    recipeData,
    isSubmitting,
    error,
    updateRecipeData,
    addIngredient,
    removeIngredient,
    addInstructionStep,
    updateInstructionStep,
    removeInstructionStep,
    submitRecipe
  };
}; 