// Environment configuration
const config = {
  API_BASE_URL: '/CustomRecipeManager', // API stays at the app level, not in static
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// Debug logging to help diagnose issues
console.log('Frontend Config:', {
  API_BASE_URL: config.API_BASE_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  IS_DEVELOPMENT: config.IS_DEVELOPMENT,
  IS_PRODUCTION: config.IS_PRODUCTION
});

export default config; 