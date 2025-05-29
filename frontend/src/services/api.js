// API service for backend communication
// py4web backend server URL
const API_BASE_URL = 'http://localhost:8000/CustomRecipeManager';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
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

    console.log('Making API request:', { url, config });

    try {
      const response = await fetch(url, config);
      console.log('API response:', response);

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
}

export default new ApiService(); 