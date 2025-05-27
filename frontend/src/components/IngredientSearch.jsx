import {useState, useEffect} from "react"; 
import mockIngredients from "./mockIngredients";

const getUnit = (field) => {
  const unitMap = {
    calories_per_unit: "kcal", 
    protein_per_unit: "g", 
    fat_per_unit: "g", 
    carbs_per_unit: "g", 
    sugar_per_unit: "g", 
    fiber_per_unit: "g", 
    sodium_per_unit: "g", 
  }; 
  return unitMap[field] || ""; 
}; 

function IngredientSearch() {
  const [query, setQuery] = useState(''); 
  const [filtered, setFiltered] = useState(mockIngredients); 
  const [page, setPage] = useState(1); 
  const perPage = 5; 

  useEffect(() => {
    const delay = setTimeout(() => {
      const q = query.toLowerCase().trim(); 
      if (q) {
        const match = mockIngredients.filter(ing =>
          ing.name.toLowerCase().startsWith(q)
        );
        setFiltered(match); 
      } else {
        setFiltered(mockIngredients)
      }
      setPage(1); 
    }, 300); 
    return () => clearTimeout(delay);
  }, [query]);

  const totalPages = Math.ceil(filtered.length / perPage); 
  const resultsToShow = filtered.slice((page - 1) * perPage, page * perPage); 

  return (
    <section className="min-h-screen bg-gradient-to-br from-lime-50 to-emerald-100 py-12 px-4 flex flex-col items-center">
      <h2 className="text-4xl font-bold text-emerald-800 mb-4 text-center">
        Search Ingredients
      </h2>

      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md p-3 rounded-full border border-emerald-400 bg-white text-gray-800 placeholder-emerald-400 shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4 text-center"
        />

        {query.trim() != '' && (
          <p className='text-sm text-emerald-700 mb-4'>
            Showing {filtered.length} result(s) for "<span className="font-semibold">{query}</span>"
          </p>
        )}

        {resultsToShow.length > 0 ? (
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
                  {resultsToShow.map((ing, i) => (
                    <tr key={i} className="hover:bg-emerald-50 transition">
                      <td className="px-4 py-2 border text-gray-800">{ing.name}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.unit}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.calories_per_unit}{getUnit("calories_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.protein_per_unit}{getUnit("protein_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.fat_per_unit}{getUnit("fat_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.carbs_per_unit}{getUnit("carbs_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.sugar_per_unit}{getUnit("sugar_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.fiber_per_unit}{getUnit("fiber_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.sodium_per_unit}{getUnit("sodium_per_unit")}</td>
                      <td className="px-4 py-2 border text-gray-800">{ing.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                onClick = {() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-6">No ingredients found.</p>
        )}
    </section>
  );
}

export default IngredientSearch; 
