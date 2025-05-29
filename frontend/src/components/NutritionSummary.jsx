import React from 'react';

const NutritionSummary = ({ nutrition }) => {
  const { perServing } = nutrition;

  const nutritionItems = [
    { label: 'Calories', value: perServing.calories, unit: 'kcal', color: 'text-red-600' },
    { label: 'Protein', value: perServing.protein, unit: 'g', color: 'text-blue-600' },
    { label: 'Fat', value: perServing.fat, unit: 'g', color: 'text-yellow-600' },
    { label: 'Carbs', value: perServing.carbs, unit: 'g', color: 'text-green-600' },
    { label: 'Sugar', value: perServing.sugar, unit: 'g', color: 'text-pink-600' },
    { label: 'Fiber', value: perServing.fiber, unit: 'g', color: 'text-purple-600' },
    { label: 'Sodium', value: perServing.sodium, unit: 'mg', color: 'text-gray-600' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Per Serving</h3>
      
      <div className="space-y-3">
        {nutritionItems.map(({ label, value, unit, color }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className={`text-sm font-semibold ${color}`}>
              {value} {unit}
            </span>
          </div>
        ))}
      </div>

      {/* Visual representation for main macros */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Macronutrient Breakdown</h4>
        
        <div className="space-y-2">
          {/* Protein */}
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600 flex-1">Protein</span>
            <span className="text-sm font-medium text-gray-900">{perServing.protein}g</span>
          </div>
          
          {/* Fat */}
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <span className="text-sm text-gray-600 flex-1">Fat</span>
            <span className="text-sm font-medium text-gray-900">{perServing.fat}g</span>
          </div>
          
          {/* Carbs */}
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-600 flex-1">Carbs</span>
            <span className="text-sm font-medium text-gray-900">{perServing.carbs}g</span>
          </div>
        </div>
      </div>

      {/* Calorie breakdown */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{perServing.calories}</div>
          <div className="text-sm text-gray-600">calories per serving</div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 text-xs text-gray-500">
        <p>* Nutrition values are calculated based on ingredient data and may vary depending on preparation methods and specific brands used.</p>
      </div>
    </div>
  );
};

export default NutritionSummary; 