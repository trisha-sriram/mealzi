// src/components/RecipeDashboardHeader.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';


// Search Icon SVG
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Plus Icon SVG
const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Helper for random values
const getRandom = (min, max) => Math.random() * (max - min) + min;

function RecipeDashboardHeader({ searchTerm, setSearchTerm, handleSearchSubmit, onOpenCreateRecipeModal }) { 
  // Memoize background animated elements
  const backgroundShapes = useMemo(() => 
    Array(7).fill(0).map((_, i) => ({
      id: `shape-${i}`,
      size: getRandom(50, 200),
      x: getRandom(0, 100), 
      y: getRandom(0, 100), 
      opacity: getRandom(0.05, 0.15), 
      duration: getRandom(12, 22),
      delay: getRandom(0, 2),
      borderRadius: Math.random() > 0.5 ? '100%' : '30% 70% 70% 30% / 30% 30% 70% 70%',
      color: `hsla(${getRandom(90, 150)}, 70%, 70%, ${getRandom(0.2, 0.6)})`
    })),
  []); 

  const foodEmojisList = useMemo(() => ["🥕", "🍅", "🥦", "🧅", "🧄", "🌶️", "🌽", "🍄", "🍋"], []);
  const floatingEmojis = useMemo(() =>
    Array(5).fill(0).map((_, i) => ({
      id: `emoji-${i}`,
      emoji: foodEmojisList[i % foodEmojisList.length],
      x: getRandom(5, 95),
      y: getRandom(10, 90), 
      size: getRandom(20, 35), 
      duration: getRandom(18, 28),
      delay: getRandom(0, 5),
    })),
  [foodEmojisList]);


  return (
    <motion.section 
      className="w-full flex flex-col items-center text-center py-12 md:py-16 px-6 bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-600 text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Animated Background Shapes */}
      {backgroundShapes.map(shape => (
        <motion.div
          key={shape.id}
          className="absolute pointer-events-none"
          style={{
            width: shape.size, height: shape.size,
            left: `${shape.x}%`, top: `${shape.y}%`, 
            backgroundColor: shape.color, borderRadius: shape.borderRadius,
            zIndex: 0,
          }}
          initial={{ scale: 0, opacity: 0, rotate: getRandom(-45,45) }}
          animate={{
            scale: [0.5, 1.1, 0.8, 1], opacity: [0, shape.opacity, shape.opacity * 0.7, 0],
            rotate: [getRandom(-45,45), getRandom(-45,45), getRandom(-45,45)],
            x: [0, getRandom(-20,20), getRandom(-20,20), 0], 
            y: [0, getRandom(-20,20), getRandom(-20,20), 0], 
          }}
          transition={{
            duration: shape.duration, delay: shape.delay,
            repeat: Infinity, repeatType: "mirror", ease: "easeInOut"
          }}
        />
      ))}
      {floatingEmojis.map(item => (
         <motion.div
            key={item.id}
            className="absolute text-4xl pointer-events-none" 
            style={{
                fontSize: item.size, left: `${item.x}%`, top: `${item.y}%`, 
                zIndex: 1, 
            }}
            initial={{ opacity: 0, y: 30, scale: 0.5 }} 
            animate={{
                opacity: [0, 0.7, 0.7, 0], y: [30, -30, -50], 
                x: [0, getRandom(-15,15), getRandom(-15,15), 0],
                rotate: [0, getRandom(-15,15), getRandom(-15,15), 0],
                scale: [0.5, 1, 1.1, 0.5]
            }}
            transition={{
                duration: item.duration, delay: item.delay,
                repeat: Infinity, repeatType: "loop", ease: "linear"
            }}
        >
            {item.emoji}
        </motion.div>
      ))}
      
      <div className="relative z-10 max-w-3xl mx-auto"> 
        <motion.h2 
          className="text-3xl md:text-4xl lg:text-4xl font-bold font-cute mb-3 leading-tight"
          initial={{ opacity:0, y: -10}} animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut"}}
        >
          Your Culinary Universe, Unleashed!
        </motion.h2>
        <motion.p 
          className="text-md md:text-lg lg:text-xl text-lime-100 max-w-2xl mx-auto mb-8"
          initial={{ opacity:0, y: -10}} animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut"}}
        >
          All your favorite recipes, all in one place. Found a gem online or have a family secret? Add your own and build your ultimate cookbook!
        </motion.p>

        <motion.div 
          className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
        >
          <form onSubmit={handleSearchSubmit} className="relative flex-grow w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <SearchIcon />
            </div>
            <input
              type="search" placeholder="Search your recipes..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3.5 pl-12 pr-4 text-gray-900 bg-white/95 border-2 border-transparent rounded-xl shadow-lg focus:ring-lime-400 focus:border-lime-400 focus:bg-white transition-all placeholder-gray-500 text-base md:text-lg"
            />
          </form>
          <div className="flex items-center w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenCreateRecipeModal} 
              className="w-full sm:w-auto flex items-center justify-center px-5 py-3.5 bg-white hover:bg-lime-50 text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 text-base md:text-lg whitespace-nowrap"
            >
              <PlusCircleIcon />
              Create New Recipe
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default RecipeDashboardHeader;
