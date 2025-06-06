import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Authentication Context
import { AuthProvider } from './context/AuthContext.jsx';

// Global components
import Navbar from "./components/Navbar.jsx";
import Footer from './components/Footer.jsx';

// Page components
import LandingPage from './pages/LandingPage';
import RecipeDashboard from './pages/RecipeDashboard.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CreateRecipePage from './pages/CreateRecipePage.jsx';
import IngredientSearch from './components/IngredientSearch.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRecipes from './pages/PublicRecipes.jsx';
import ShareableRecipe from './pages/ShareableRecipe.jsx';

function App() {
  return (
    <AuthProvider>
      <Router basename="/CustomRecipeManager/static">
        <div className="App flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/recipes" element={<PublicRecipes />} />
              <Route path="/recipe/:id" element={<ShareableRecipe />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <RecipeDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-recipe" 
                element={
                  <ProtectedRoute>
                    <CreateRecipePage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/ingredients" element={<IngredientSearch />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;