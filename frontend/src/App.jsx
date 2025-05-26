import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Global components (visible on all pages)
import Navbar from "./components/Navbar.jsx";
import Footer from './components/Footer.jsx';

// Page components
import LandingPage from './pages/LandingPage'; // Assuming you've created src/pages/LandingPage.js as per the other Canvas
import RecipeDashboard from './pages/RecipeDashboard.jsx'; // We'll define this page next


function App() {
  return (
    <Router> {/* BrowserRouter provides routing capabilities */}
      <div className="App flex flex-col min-h-screen"> {/* Ensure App takes full height for sticky footer */}
        <Navbar />
        <main className="flex-grow"> {/* Main content area that will change based on route */}
          <Routes> {/* Container for all your routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/recipe-dashboard" element={<RecipeDashboard />} />
            {/* Add more routes here as needed, e.g.: */}
            {/* <Route path="/recipes" element={<AllRecipesPage />} /> */}
            {/* <Route path="/recipes/:id" element={<RecipeDetailPage />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
