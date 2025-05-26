import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

function AuthModals({ showSignIn, showSignUp, setShowSignIn, setShowSignUp }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '', rememberMe: false });
  const [signUpData, setSignUpData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    terms: false 
  });
  
  // Loading and error states
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  
  // Switch between modals
  const openSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
    // Clear form data and errors when switching
    setSignInData({ email: '', password: '', rememberMe: false });
    setSignInError('');
  };
  
  const openSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
    // Clear form data and errors when switching
    setSignUpData({ 
      first_name: '', 
      last_name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      terms: false 
    });
    setSignUpError('');
  };
  
  const closeModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    // Clear form data and errors when closing
    setSignInData({ email: '', password: '', rememberMe: false });
    setSignUpData({ 
      first_name: '', 
      last_name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      terms: false 
    });
    setSignInError('');
    setSignUpError('');
  };

  // Handle sign in form submission
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);

    try {
      const result = await login(signInData.email, signInData.password);
      
      if (result.success) {
        closeModals(); // Close modal on successful login
        if (result.redirect) {
          navigate(result.redirect); // Use React Router's navigate instead of window.location
        }
      } else {
        setSignInError(result.error);
      }
    } catch (error) {
      setSignInError('An unexpected error occurred. Please try again.');
    } finally {
      setSignInLoading(false);
    }
  };

  // Handle sign up form submission
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Passwords do not match');
      return;
    }

    if (!signUpData.terms) {
      setSignUpError('Please accept the terms and conditions');
      return;
    }

    setSignUpLoading(true);

    try {
      const result = await register({
        first_name: signUpData.first_name,
        last_name: signUpData.last_name,
        email: signUpData.email,
        password: signUpData.password,
      });
      
      if (result.success) {
        closeModals(); // Close modal on successful registration
        if (result.redirect) {
          navigate(result.redirect); // Use React Router's navigate for redirect
        }
      } else {
        setSignUpError(result.error);
      }
    } catch (error) {
      setSignUpError('An unexpected error occurred. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  // Handle input changes
  const handleSignInChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignInData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignUpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  return (
    <>
      {/* Sign In Modal */}
      <AnimatePresence>
        {showSignIn && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModals}
          >
            <motion.div 
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className="text-2xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                    >
                      🥕
                    </motion.span>
                    <span className="text-2xl font-logo font-bold text-emerald-600">Mealzi</span>
                  </div>
                  <motion.button 
                    onClick={closeModals}
                    className="text-gray-500 hover:text-gray-800"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 font-cute">Welcome back</h2>
                <p className="text-gray-600">Sign in to your account to continue</p>
              </div>
              
              {/* Form */}
              <div className="p-8">
                <form className="space-y-5" onSubmit={handleSignInSubmit}>
                  {/* Error Message */}
                  {signInError && (
                    <motion.div
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {signInError}
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={signInData.email}
                        onChange={handleSignInChange}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  
                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <a href="#" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={signInData.password}
                        onChange={handleSignInChange}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  {/* Remember Me Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={signInData.rememberMe}
                      onChange={handleSignInChange}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: signInLoading ? 1 : 1.02 }}
                    whileTap={{ scale: signInLoading ? 1 : 0.98 }}
                  >
                    {/* Button shine effect */}
                    {!signInLoading && (
                    <motion.span 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: -100, opacity: 0 }}
                      whileHover={{ x: 200, opacity: 0.5 }}
                      transition={{ duration: 0.6 }}
                    />
                    )}
                    {signInLoading ? 'Signing in...' : 'Sign in'}
                  </motion.button>
                </form>
                
                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">or continue with</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                {/* Social Sign In Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    className="py-2.5 px-4 border border-gray-300 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.266 9.765A7.077 7.077 0 012.5 12c0 .808.136 1.585.387 2.31a7.08 7.08 0 002.379 3.474 7.077 7.077 0 003.474 1.38 7.08 7.08 0 003.474-.309 7.08 7.08 0 002.378-1.69 7.08 7.08 0 001.38-2.6 7.077 7.077 0 00-.309-3.475 7.08 7.08 0 00-1.69-2.378A7.08 7.08 0 0012 8a7.08 7.08 0 00-3.474.84A7.08 7.08 0 006.15 10.53a7.08 7.08 0 00-.884 1.079v-1.844z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.266 14.235A7.077 7.077 0 002.5 12c0-.808.136-1.585.387-2.31a7.08 7.08 0 012.379-3.474l3.474 3.474-.884 1.079-3.39 3.466z"
                      />
                      <path
                        fill="#4285F4"
                        d="M12 8a7.08 7.08 0 00-2.378.32 7.08 7.08 0 00-2.08 1.179A7.08 7.08 0 006.15 10.53l-3.39-3.466a7.08 7.08 0 011.38-1.098A7.08 7.08 0 015.617 4.92 7.08 7.08 0 017.998 3.77 7.08 7.08 0 0112 3.5a7.08 7.08 0 012.618.491 7.08 7.08 0 012.236 1.38 7.08 7.08 0 011.618 2.07 7.08 7.08 0 01.615 3.017c0 1.732-.465 2.984-1.398 3.756L12 8z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 16.5a7.08 7.08 0 003.474-.84 7.08 7.08 0 002.378-1.69l4.286 4.287A7.08 7.08 0 0118.9 20.06a7.08 7.08 0 01-2.618 1.029c-.863.174-1.74.261-2.618.261a7.08 7.08 0 01-3.474-.84 7.08 7.08 0 01-2.378-1.69 7.08 7.08 0 01-1.38-2.6 7.08 7.08 0 01-.309-3.476 7.08 7.08 0 01.309-1.29 7.08 7.08 0 01.566-1.175l3.474 3.474A7.08 7.08 0 0112 16.5z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">Google</span>
                  </motion.button>
                  
                  <motion.button
                    className="py-2.5 px-4 border border-gray-300 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                    <span className="text-sm text-gray-700">Facebook</span>
                  </motion.button>
                </div>
                
                {/* Switch to Sign Up */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button 
                      className="text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
                      onClick={openSignUp}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
      {/* Sign Up Modal */}
      <AnimatePresence>
        {showSignUp && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModals}
          >
            <motion.div 
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-emerald-500 to-lime-500 p-8">
                <motion.div
                  className="absolute top-0 right-0 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.button 
                    onClick={closeModals}
                    className="text-white hover:text-gray-200"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </motion.div>
                
                <div className="flex items-center gap-2 mb-4">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  >
                    🥕
                  </motion.span>
                  <span className="text-2xl font-logo font-bold text-white">Mealzi</span>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-1 font-cute">Create your account</h2>
                <p className="text-lime-100">Join thousands of home cooks transforming their meals</p>
                
                {/* Decorative elements */}
                {["🍅", "🥦", "🥑"].map((emoji, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-2xl"
                    style={{
                      top: `${60 + index * 20}%`,
                      right: `${10 + index * 15}%`,
                      opacity: 0.5
                    }}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
              
              {/* Form */}
              <div className="p-8">
                <form className="space-y-4" onSubmit={handleSignUpSubmit}>
                  {/* Error Message */}
                  {signUpError && (
                    <motion.div
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {signUpError}
                    </motion.div>
                  )}

                  {/* Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={signUpData.first_name}
                        onChange={handleSignUpChange}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="John"
                      />
                    </div>
                  </div>

                  {/* Last Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        value={signUpData.last_name}
                        onChange={handleSignUpChange}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="email-signup"
                        name="email"
                        type="email"
                        required
                        value={signUpData.email}
                        onChange={handleSignUpChange}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  
                  {/* Password Input */}
                  <div className="space-y-2">
                    <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="password-signup"
                        name="password"
                        type="password"
                        required
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpChange}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  {/* Terms Checkbox */}
                  <div className="flex items-start mt-4">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        checked={signUpData.terms}
                        onChange={handleSignUpChange}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-600">
                        I agree to the{" "}
                        <a href="#" className="text-emerald-600 hover:text-emerald-800">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-emerald-600 hover:text-emerald-800">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={signUpLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all relative overflow-hidden group mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: signUpLoading ? 1 : 1.02 }}
                    whileTap={{ scale: signUpLoading ? 1 : 0.98 }}
                  >
                    {/* Button shine effect */}
                    {!signUpLoading && (
                    <motion.span 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: -100, opacity: 0 }}
                      whileHover={{ x: 200, opacity: 0.5 }}
                      transition={{ duration: 0.6 }}
                    />
                    )}
                    {signUpLoading ? 'Creating account...' : 'Create account'}
                  </motion.button>
                  
                  {/* Switch to Sign In */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button 
                        className="text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
                        onClick={openSignIn}
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AuthModals;