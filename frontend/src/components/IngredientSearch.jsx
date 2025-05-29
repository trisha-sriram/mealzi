import {useState, useEffect} from "react"; 
import apiService from "../services/api";

const getUnit = (field) => {
  const unitMap = {
    calories_per_unit: "kcal", 
    protein_per_unit: "g", 
    fat_per_unit: "g", 
    carbs_per_unit: "g", 
    sugar_per_unit: "g", 
    fiber_per_unit: "g", 
    sodium_per_unit: "mg", 
  }; 
  return unitMap[field] || ""; 
}; 

function IngredientSearch() {
  const [query, setQuery] = useState(''); 
  const [ingredients, setIngredients] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); 
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 10; 

  useEffect(() => {
    const searchIngredients = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.searchIngredients(query, page, perPage);
        setIngredients(response.ingredients || []);
        setTotalCount(response.total || 0);
      } catch (error) {
        console.error('Error searching ingredients:', error);
        setIngredients([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    const delay = setTimeout(() => {
      searchIngredients();
    }, 300); 
    
    return () => clearTimeout(delay);
  }, [query, page]);

  const totalPages = Math.ceil(totalCount / perPage); 

  return (
    <section className="min-h-screen bg-gradient-to-br from-lime-50 to-emerald-100 py-12 px-4 flex flex-col items-center">
      <h2 className="text-4xl font-bold text-emerald-800 mb-4 text-center">
        Search Ingredients
      </h2>

      <input
        type="text"
        placeholder="Search ingredients..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1); // Reset to first page when searching
        }}
        className="w-full max-w-md p-3 rounded-full border border-emerald-400 bg-white text-gray-800 placeholder-emerald-400 shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4 text-center"
        />

        {query.trim() !== '' && (
          <p className='text-sm text-emerald-700 mb-4'>
            Showing {ingredients.length} of {totalCount} result(s) for "<span className="font-semibold">{query}</span>"
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-emerald-700">Searching...</span>
          </div>
        ) : ingredients.length > 0 ? (
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-emerald-100">
                  <tr className="text-emerald-800 text-xs uppercase font-bold tracking-wide">
                    <th className="px-4 py-2 border"> Name</th>
                    <th className="px-4 py-2 border"> Unit</th>
                    <th className="px-4 py-2 border"> Calories</th>
                    <th className="px-4 py-2 border"> Protein</th>
                    <th className="px-4 py-2 border"> Fat</th>
                    <th className="px-4 py-2 border"> Carbs</th>
                    <th className="px-4 py-2 border"> Sugar</th>
                    <th className="px-4 py-2 border"> Fiber</th>
                    <th className="px-4 py-2 border"> Sodium</th>
                    <th className="px-4 py-2 border"> Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-emerald-50 transition">
                      <td className="px-4 py-2 border text-gray-800 font-medium">{ing.name}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.unit}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.calories_per_unit || 0} {getUnit("calories_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.protein_per_unit || 0} {getUnit("protein_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.fat_per_unit || 0} {getUnit("fat_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.carbs_per_unit || 0} {getUnit("carbs_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.sugar_per_unit || 0} {getUnit("sugar_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.fiber_per_unit || 0} {getUnit("fiber_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.sodium_per_unit || 0} {getUnit("sodium_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.description || 'No description'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition disabled:opacity-40"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span className="text-emerald-800 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition disabled:opacity-40"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {query.trim() ? 'No ingredients found.' : 'Start typing to search for ingredients...'}
            </p>
            {query.trim() && (
              <p className="text-sm text-gray-500">
                Try searching for common ingredients like "chicken", "rice", or "tomato"
              </p>
            )}
          </div>
        )}
    </section>
  );
}

export default IngredientSearch; 
