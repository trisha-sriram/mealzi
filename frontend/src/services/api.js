// API service for backend communication
import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    console.log('Making API request:', { 
      baseURL: this.baseURL,
      endpoint,
      url, 
      config 
    });

    try {
      const response = await fetch(url, config);
      console.log('API response status:', response.status, 'URL:', url);

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Response data:', data);
      } else {
        const text = await response.text();
        console.log('Response text:', text);
        throw new Error('Invalid response format');
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Ingredient endpoints
  async searchIngredients(query = '', page = 1, limit = 10) {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/api/ingredients/search?${params}`);
  }

  async createIngredient(ingredientData) {
    return this.request('/api/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }

  // Recipe endpoints
  async createRecipe(recipeData) {
    // If recipeData is FormData, send it directly
    if (recipeData instanceof FormData) {
      return this.request('/api/recipes', {
        method: 'POST',
        body: recipeData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    }
    
    // If recipeData.images contains files, use FormData
    if (recipeData.images && recipeData.images.length > 0 && recipeData.images[0] instanceof File) {
      const formData = new FormData();
      for (const key in recipeData) {
        if (recipeData[key] !== undefined && recipeData[key] !== null) {
          if (key === 'ingredients' && Array.isArray(recipeData[key])) {
            formData.append(key, JSON.stringify(recipeData[key]));
          } else if (key === 'instruction_steps' && Array.isArray(recipeData[key])) {
            formData.append(key, JSON.stringify(recipeData[key]));
          } else if (key === 'images') {
            // Append each image file
            recipeData.images.forEach((image) => {
              formData.append('images', image, image.name);
            });
          } else {
            formData.append(key, recipeData[key]);
          }
        }
      }
      return this.request('/api/recipes', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    }
    
    // Fallback to JSON
    return this.request('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getUserRecipes() {
    console.log('Getting user recipes...');
    try {
      const response = await this.request('/api/recipes');
      console.log('User recipes response:', response);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Failed to get user recipes');
      }
    } catch (error) {
      console.error('Error getting user recipes:', error);
      return { success: false, recipes: [] };
    }
  }

  async getPublicRecipes() {
    return this.request('/api/recipes/public');
  }

  async searchRecipes(nameQuery = '', typeQuery = '', page = 1, limit = 10) {
    const params = new URLSearchParams();
    if (nameQuery) params.append('name', nameQuery);
    if (typeQuery) params.append('type', typeQuery);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return this.request(`/api/recipes/search?${params}`);
  }

  async searchRecipesByIngredients(ingredientIds = [], matchAll = false, nameQuery = '', typeQuery = '', page = 1, limit = 10) {
    const params = new URLSearchParams();
    
    // Convert ingredient IDs array to comma-separated string
    if (ingredientIds.length > 0) {
      params.append('ingredients', ingredientIds.join(','));
    }
    
    // Include match_all parameter (default: false)
    params.append('match_all', matchAll.toString());
    
    // Add optional name and type filters only if provided
    if (nameQuery && nameQuery.trim()) params.append('name', nameQuery);
    if (typeQuery && typeQuery.trim()) params.append('type', typeQuery);
    
    // Pagination params
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return this.request(`/api/recipes/search_by_ingredients?${params}`);
  }

  async getRecipeDetail(recipeId) {
    return this.request(`/api/recipes/${recipeId}`);
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/user');
  }

  // Contact endpoint
  async submitContact(contactData) {
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateRecipe(recipeId, recipeData, isFormData = false) {
    if (isFormData && recipeData instanceof FormData) {
      return this.request(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        body: recipeData,
        headers: {}, // Let browser set Content-Type
      });
    }
    return this.request(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async deleteRecipe(recipeId) {
    return this.request(`/api/recipes/${recipeId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService(); 