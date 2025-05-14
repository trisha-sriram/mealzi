
function Navbar() {
    return (
        <nav className="flex flex-row items-center justify-between px-8 py-4 bg-white shadow-md">
            {/* Logo */}
            <span className="text-3xl font-bold text-emerald-600 tracking-tight">
                Mealzi
            </span>

            {/* Nav Links*/}
            <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-xl font-semibold">Home</a>
                <a href="#" className="text-xl font-semibold">About</a>
                <a href="#" className="text-xl font-semibold">Features</a>
                <a href="#" className="text-xl font-semibold">Contact</a>
            </div>

            <div className="md:hidden"> {/* hamburger menu */} </div>

            <div className="flex gap-4">
                <button className="border-black border-2 rounded-lg px-6 py-1 text-xl font-semibold hover:bg-emerald-50 transition">Register</button>
                <button className="border-black border-2 rounded-lg px-6 py-1 text-xl font-semibold hover:bg-emerald-700 transition">Login</button>
            </div>
        </nav>
    )
}

export default Navbar;