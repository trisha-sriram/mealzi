import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lime-50 pt-20">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg text-gray-600">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lime-50 pt-20">
        <motion.div
          className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3 
            }}
          >
            🔒
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-cute">
            Welcome to Your Recipe Dashboard!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Please sign in to access your personalized recipe collection and create amazing dishes.
          </p>
          
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-emerald-600 font-medium">
              ✨ Create and save your recipes
            </p>
            <p className="text-sm text-emerald-600 font-medium">
              🍽️ Access your personal dashboard
            </p>
            <p className="text-sm text-emerald-600 font-medium">
              📊 Track your culinary journey
            </p>
          </motion.div>
          
          <motion.div
            className="mt-8"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-sm text-gray-500">
              Click the "Sign In" or "Get Started" button in the navigation bar above to continue.
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute; 