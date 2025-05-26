import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Authentication Context
import { AuthProvider } from './context/AuthContext.jsx';

// Global components (visible on all pages)
import Navbar from "./components/Navbar.jsx";
import Footer from './components/Footer.jsx';

// Page components
import LandingPage from './pages/LandingPage'; // Assuming you've created src/pages/LandingPage.js as per the other Canvas
import RecipeDashboard from './pages/RecipeDashboard.jsx'; // We'll define this page next
import ContactPage from './pages/ContactPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // We'll create this component

function App() {
  return (
    <AuthProvider>
      <Router> {/* BrowserRouter provides routing capabilities */}
        <div className="App flex flex-col min-h-screen"> {/* Ensure App takes full height for sticky footer */}
          <Navbar />
          <main className="flex-grow"> {/* Main content area that will change based on route */}
            <Routes> {/* Container for all your routes */}
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <RecipeDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
