import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import AuthModals from "./AuthModals";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 50);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const openSignIn = () => {
        setShowSignUp(false);
        setShowSignIn(true);
    };
    
    const openSignUp = () => {
        setShowSignIn(false);
        setShowSignUp(true);
    };

    const handleLogout = async () => {
        setShowUserMenu(false);
        await logout();
        navigate('/');
    };

    return (
        <>
            <motion.nav 
                className={`fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between px-6 md:px-12 py-4 ${scrolled ? 'bg-white/95' : 'bg-white/80'} backdrop-blur-md transition-all duration-300`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    boxShadow: scrolled 
                        ? "0 10px 30px -10px rgba(0, 0, 0, 0.1)" 
                        : "0 10px 30px -10px rgba(0, 0, 0, 0.05)"
                }}
            >
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <motion.span 
                            className="text-2xl"
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                repeatDelay: 5
                            }}
                        >
                            🥕
                        </motion.span>
                        <span className="text-2xl md:text-3xl font-logo font-bold text-emerald-600 tracking-tight">
                            Mealzi
                        </span>
                    </motion.div>
                </Link>

                {/* Navigation Links - Only show for non-authenticated users */}
                {!isAuthenticated() && (
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
                        >
                            Home
                            <motion.span 
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full origin-left" 
                                initial={{ scaleX: 0 }} 
                                whileHover={{ scaleX: 1 }} 
                                transition={{ duration: 0.3 }}
                            />
                        </Link>
                        <a
                            href="#features"
                            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
                        >
                            Features
                            <motion.span 
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full origin-left" 
                                initial={{ scaleX: 0 }} 
                                whileHover={{ scaleX: 1 }} 
                                transition={{ duration: 0.3 }}
                            />
                        </a>
                        <a
                            href="#about"
                            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
                        >
                            About
                            <motion.span 
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full origin-left" 
                                initial={{ scaleX: 0 }} 
                                whileHover={{ scaleX: 1 }} 
                                transition={{ duration: 0.3 }}
                            />
                        </a>
                        <Link
                            to="/contact"
                            className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group"
                        >
                            Contact
                            <motion.span 
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full origin-left" 
                                initial={{ scaleX: 0 }} 
                                whileHover={{ scaleX: 1 }} 
                                transition={{ duration: 0.3 }}
                            />
                        </Link>
                    </div>
                )}

                {/* Auth Buttons */}
                <div className="flex gap-3 items-center">
                    {isAuthenticated() ? (
                        <div className="relative">
                            <motion.button
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-gray-800 font-medium hidden md:block">
                                    {user?.first_name || 'User'}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-600 transition-transform hidden md:block ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </motion.button>

                            {/* User dropdown menu */}
                            {showUserMenu && (
                                <motion.div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        📊 Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        🚪 Sign out
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <>
                            <motion.button 
                                className="px-5 py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200 relative overflow-hidden group"
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }} 
                                onClick={openSignIn}
                            >
                                Sign in
                                <motion.span 
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full origin-left" 
                                    initial={{ scaleX: 0 }} 
                                    whileHover={{ scaleX: 1 }} 
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.button>
                            <motion.button 
                                className="relative group bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-medium px-5 py-2 rounded-lg hover:from-emerald-700 hover:to-lime-600 transition-all duration-200" 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }} 
                                onClick={openSignUp}
                            >
                                <span className="relative inline-flex items-center gap-1">
                                    Get Started
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </motion.button>
                        </>
                    )}
                </div>
            </motion.nav>

            {/* Auth Modals */}
            <AuthModals 
                showSignIn={showSignIn} 
                showSignUp={showSignUp}
                setShowSignIn={setShowSignIn}
                setShowSignUp={setShowSignUp}
            />
        </>
    );
}

export default Navbar;
