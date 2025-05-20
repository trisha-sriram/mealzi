import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AuthModals from "./AuthModals"; // Import the AuthModals component

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("Home");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Functions to control modals
    const openSignIn = () => {
        setMobileMenuOpen(false);
        setShowSignUp(false);  // Ensure sign up modal is closed
        setShowSignIn(true);
    };
    
    const openSignUp = () => {
        setMobileMenuOpen(false);
        setShowSignIn(false);  // Ensure sign in modal is closed
        setShowSignUp(true);
    };

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "Recipes", href: "#recipes" },
        { name: "Features", href: "#features" },
        { name: "About", href: "#about" }
    ];

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
                <motion.div
                    className="flex items-center gap-2"
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

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            className={`relative font-medium text-gray-800 hover:text-emerald-600 transition-colors duration-200 py-1 px-2`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveLink(link.name);
                            }}
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {link.name}
                            {activeLink === link.name && (
                                <motion.div
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                                    layoutId="navbar-underline"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </motion.a>
                    ))}
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

                {/* CTA Buttons */}
                <div className="hidden md:flex gap-3 items-center">
                    <motion.button 
                        className="px-5 py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200 relative overflow-hidden group"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
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
                        className="relative group"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={openSignUp}
                    >
                        {/* Button background with gradient */}
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-lime-500 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                        
                        {/* Button shine effect */}
                        <motion.span 
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg"
                            initial={{ x: -100, opacity: 0 }}
                            whileHover={{ x: 200, opacity: 0.5 }}
                            transition={{ duration: 0.6 }}
                        />
                        
                        {/* Button text */}
                        <span className="relative inline-flex items-center gap-1 text-white font-medium px-5 py-2">
                            Get Started
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </motion.button>
                </div>
            </motion.nav>

            {/* Mobile menu overlay */}
            <motion.div
                className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: mobileMenuOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile menu panel */}
            <motion.div
                className={`fixed top-[72px] left-0 right-0 bg-white shadow-lg rounded-b-2xl z-40 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
                initial={{ opacity: 0, y: -50 }}
                animate={{ 
                    opacity: mobileMenuOpen ? 1 : 0,
                    y: mobileMenuOpen ? 0 : -50
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="flex flex-col py-4 gap-1">
                    {navLinks.map((link, index) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            className={`px-8 py-3 ${activeLink === link.name ? 'bg-emerald-50 text-emerald-600' : 'text-gray-800'} hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveLink(link.name);
                                setMobileMenuOpen(false);
                            }}
                        >
                            {link.name}
                        </motion.a>
                    ))}
                    <div className="mx-6 my-2 border-t border-gray-100" />
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