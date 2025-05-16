function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between px-6 md:px-12 py-4 bg-white/90 backdrop-blur-sm shadow-sm">
            {/* Logo */}
            <span className="text-2xl md:text-3xl font-bold text-emerald-600 tracking-tight flex items-center gap-1">
                <span className="text-2xl">🥕</span> Mealzi
            </span>

            {/* Nav Links*/}
            <div className="hidden md:flex items-center gap-8">
                <a href="#" className="text-gray-800 hover:text-emerald-600 transition-colors duration-200 font-medium">Home</a>
                <a href="#" className="text-gray-800 hover:text-emerald-600 transition-colors duration-200 font-medium">Recipes</a>
                <a href="#" className="text-gray-800 hover:text-emerald-600 transition-colors duration-200 font-medium">Features</a>
                <a href="#" className="text-gray-800 hover:text-emerald-600 transition-colors duration-200 font-medium">About</a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <div className="hidden md:flex gap-3">
                <button className="px-5 py-2 text-gray-800 font-medium hover:text-emerald-600 transition-colors duration-200">Sign in</button>
                <button className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200">Get Started</button>
            </div>
        </nav>
    )
}

export default Navbar;