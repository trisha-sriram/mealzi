import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import Link, useLocation, and useNavigate
import AuthModals from "./AuthModals"; // Assuming this is in the same directory
import { useAuth } from "../context/AuthContext"; // Import authentication context

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false); // For user dropdown menu
    
    const location = useLocation(); // Hook to get current location object
    const navigate = useNavigate(); // Hook for programmatic navigation
    const { user, logout, isAuthenticated } = useAuth(); // Get auth state and functions

    // Handle scroll effect
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

    // Functions to control modals
    const openSignIn = () => {
        setMobileMenuOpen(false); // Close mobile menu if open
        setShowSignUp(false);  // Ensure sign up modal is closed
        setShowSignIn(true);
    };
    
    const openSignUp = () => {
        setMobileMenuOpen(false); // Close mobile menu if open
        setShowSignIn(false);  // Ensure sign in modal is closed
        setShowSignUp(true);
    };

    // Handle logout
    const handleLogout = async () => {
        setShowUserMenu(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/'); // Redirect to home page after logout
    };

    const navLinks = isAuthenticated() ? [
        // No navigation links for authenticated users
    ] : [
        // Marketing navigation for non-authenticated users
        { name: "Home", href: "/", type: "route" },
        { name: "Features", href: "#features", type: "hash" },
        { name: "About", href: "#about", type: "hash" },
        { name: "Contact", href: "/contact", type: "route" }
    ];

    // Function to handle navigation for all link types
    const handleNavLinkClick = (link) => {
        setMobileMenuOpen(false); // Close mobile menu on any link click
        if (link.type === "route") {
            // React Router's <Link> component will handle this navigation automatically
            // No extra logic needed here if using <Link> directly
        } else if (link.type === "hash") {
            if (location.pathname === "/") {
                // If on the homepage, scroll smoothly to the section
                const element = document.getElementById(link.href.substring(1)); // remove #
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // If not on the homepage, navigate to the homepage and then append the hash
                // This will cause a navigation to "/" and the browser will attempt to jump to the hash
                navigate(`/${link.href}`);
            }
        }
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
                {/* Logo - now a Link */}
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
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

                {/* Nav Links - Desktop */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        // Active state for "route" type links
                        const isActiveRoute = link.type === "route" && location.pathname === link.href;
                        // Active state for "hash" links is more complex (requires scroll spy)
                        // For now, we'll only highlight direct route matches.

                        if (link.type === "route") {
                            return (
                                <motion.div key={link.name} className="relative py-1 px-2">
                                    <Link
                                        to={link.href}
                                        className={`font-medium text-gray-800 hover:text-emerald-600 transition-colors duration-200`}
                                        onClick={() => handleNavLinkClick(link)} // handleNavLinkClick handles mobile menu closure
                                    >
                                        {link.name}
                                    </Link>
                                    {isActiveRoute && (
                                        <motion.div
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                                            layoutId="navbar-underline" // For smooth animation between active links
                                        />
                                    )}
                                </motion.div>
                            );
                        } else { // type === "hash"
                            return (
                                 <motion.a
                                    key={link.name}
                                    href={link.href} 
                                    className={`relative font-medium text-gray-800 hover:text-emerald-600 transition-colors duration-200 py-1 px-2`}
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent default anchor jump before custom logic
                                        handleNavLinkClick(link);
                                    }}
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {link.name}
                                    {/* Active state for hash links would need scroll spy logic */}
                                </motion.a>
                            );
                        }
                    })}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <motion.button
                        className="p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        whileTap={{ scale: 0.9 }}
                    >
                        {mobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </motion.button>
                </div>

                {/* CTA Buttons - Desktop */}
                <div className="hidden md:flex gap-3 items-center">
                    {isAuthenticated() ? (
                        // Show user menu when authenticated
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
                                <span className="text-gray-800 font-medium">
                                    {user?.first_name || 'User'}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        // Show sign in/up buttons when not authenticated
                        <>
                            <motion.button 
                                className="px-5 py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200 relative overflow-hidden group"
                                whileHover={{ y: -2 }} whileTap={{ y: 0 }} onClick={openSignIn}
                            >
                                Sign in
                                <motion.span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full origin-left" initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.3 }}/>
                            </motion.button>
                            <motion.button 
                                className="relative group" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openSignUp}
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-lime-500 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                                <motion.span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg" initial={{ x: -100, opacity: 0 }} whileHover={{ x: 200, opacity: 0.5 }} transition={{ duration: 0.6 }} />
                                <span className="relative inline-flex items-center gap-1 text-white font-medium px-5 py-2">
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

            {/* Mobile menu overlay */}
            <motion.div
                className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: mobileMenuOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)} // Close on overlay click
            />

            {/* Mobile menu panel */}
            <motion.div
                className={`fixed top-[72px] left-0 right-0 bg-white shadow-lg rounded-b-2xl z-40 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} // Adjust top based on your navbar height
                initial={{ opacity: 0, y: -50 }}
                animate={{ 
                    opacity: mobileMenuOpen ? 1 : 0,
                    y: mobileMenuOpen ? 0 : -50
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="flex flex-col py-4 gap-1">
                    {navLinks.map((link, index) => {
                        const isActiveRoute = link.type === "route" && location.pathname === link.href;
                        if (link.type === "route") {
                           return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`block px-8 py-3 ${isActiveRoute ? 'bg-emerald-50 text-emerald-600' : 'text-gray-800'} hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200`}
                                    onClick={() => handleNavLinkClick(link)}
                                >
                                    <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 + 0.1 }}>
                                        {link.name}
                                    </motion.span>
                                </Link>
                            );
                        } else { // type === "hash"
                             return (
                                <a // Keep as <a> for hash links, onClick handles logic
                                    key={link.name}
                                    href={link.href}
                                    className={`block px-8 py-3 text-gray-800 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavLinkClick(link);
                                    }}
                                >
                                    <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 + 0.1 }}>
                                        {link.name}
                                    </motion.span>
                                </a>
                            );
                        }
                    })}
                    <div className="mx-6 my-2 border-t border-gray-100" />
                    
                    {isAuthenticated() ? (
                        // Mobile authenticated user menu
                        <div className="px-6 pt-2">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-50 rounded-lg">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            <Link
                                to="/dashboard"
                                className="block w-full py-2.5 px-4 text-center text-gray-800 font-medium border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200 mb-3"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                📊 Dashboard
                            </Link>
                            <motion.button 
                                className="w-full py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                onClick={handleLogout}
                            >
                                🚪 Sign out
                            </motion.button>
                        </div>
                    ) : (
                        // Mobile sign in/up buttons
                        <div className="flex flex-col gap-3 px-6 pt-2">
                            <motion.button 
                                className="w-full py-2.5 text-gray-800 font-medium border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={openSignIn}
                            >
                                Sign in
                            </motion.button>
                            
                            <motion.button 
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                onClick={openSignUp}
                            >
                                Get Started
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Render AuthModals component with state */}
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
