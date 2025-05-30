import { useState, useEffect } from 'react';
import { getAllRecipes } from '../services/recipeService';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Public Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{recipe.name}</h2>
              <p className="text-gray-600 mb-2">{recipe.type}</p>
              <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Servings: {recipe.servings}
                </span>
                <span className="text-sm text-gray-500">
                  By: {recipe.author_name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {recipes.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No recipes found.
        </div>
      )}
    </div>
  );
};

export default RecipeList; 