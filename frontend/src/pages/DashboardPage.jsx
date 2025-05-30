import React, { useState } from 'react';
import apiService from '../services/apiService';

const DashboardPage = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState({ text: '', type: '' });

  const handleImportMealDB = async () => {
    if (!window.confirm('Are you sure you want to import recipes from TheMealDB? This will add new recipes to your database.')) {
      return;
    }

    setIsImporting(true);
    setImportMessage({ text: 'Importing recipes...', type: 'info' });

    try {
      const response = await apiService.request('/api/import/mealdb', {
        method: 'POST',
      });

      if (response.success) {
        setImportMessage({ text: 'Recipes imported successfully!', type: 'success' });
        // Refresh the recipes list
        fetchRecipes();
      } else {
        setImportMessage({ text: response.error || 'Failed to import recipes', type: 'error' });
      }
    } catch (error) {
      setImportMessage({ text: error.message || 'An error occurred during import', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-4">
          {auth.currentUser?.is_admin && (
            <button
              onClick={handleImportMealDB}
              disabled={isImporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Import from TheMealDB'}
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Create New Recipe
          </button>
        </div>
      </div>

      {importMessage.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          importMessage.type === 'success' ? 'bg-green-100 text-green-700' :
          importMessage.type === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {importMessage.text}
        </div>
      )}

      // ... rest of existing code ...
    </div>
  );
};

export default DashboardPage; 