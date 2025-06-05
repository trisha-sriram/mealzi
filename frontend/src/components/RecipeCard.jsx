import React from 'react';
import { motion } from 'framer-motion';

// Star SVG Icon
const StarIcon = ({ filled, className }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${className || ''}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Bookmark SVG Icon
const BookmarkIcon = ({ bookmarked, className }) => (
  <svg
    className={`w-6 h-6 ${bookmarked ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400 hover:text-emerald-500'} ${className || ''}`}
    fill={bookmarked ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);


function RecipeCard({
  imageUrl,
  tag = "RECIPE OF THE DAY",
  title,
  author,
  description,
  rating = 0, // out of 5
  reviewCount = 0,
  time,
  isBookmarked = false,
  onBookmarkToggle, // Function to call when bookmark is clicked
  className,
  onViewRecipe, 
  id, 
}) {
  return (
    <motion.div
      className={`w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row ${className || ''}`}
      whileHover={{ y: -5, boxShadow: "0 25px 30px -10px rgba(0,0,0,0.1), 0 10px 15px -5px rgba(0,0,0,0.05)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Image Section */}
      <div className="relative md:w-3/5 lg:w-1/2 xl:w-3/5 flex-shrink-0">
        <img
          src={imageUrl || "https://placehold.co/800x600/a3e635/4d7c0f?text=Mealzi+Recipe"} // Placeholder
          alt={title || "Recipe image"}
          className="w-full h-64 md:h-full object-cover md:rounded-l-2xl md:rounded-r-none"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x600/fecaca/991b1b?text=Image+Error"; }}
        />
        {tag && (
          <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            {tag}
          </span>
        )}
        <motion.button
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-emerald-600 focus:outline-none shadow-md"
          onClick={onBookmarkToggle}
          whileTap={{ scale: 0.9 }}
          aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          <BookmarkIcon bookmarked={isBookmarked} className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8 flex flex-col justify-center md:w-2/5 lg:w-1/2 xl:w-2/5">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-cute leading-tight">
          {title || "Delicious Recipe Title"}
        </h2>
        {author && (
          <p className="text-sm md:text-base text-emerald-700 font-semibold mb-3">
            By {author}
          </p>
        )}
        <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed">
          {description || "A brief and enticing description of this wonderful recipe will go here. It's sure to make you hungry and want to try it out immediately!"}
        </p>

        {/* Info: Rating & Time */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center mb-3 sm:mb-0">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < Math.round(rating)} className="mr-0.5 w-4 h-4 sm:w-5 sm:h-5" />
            ))}
            {reviewCount > 0 && (
              <span className="ml-2">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            )}
             {reviewCount === 0 && rating > 0 && (
              <span className="ml-2">
                {rating.toFixed(1)}
              </span>
            )}
             {reviewCount === 0 && rating === 0 && (
                <span className="ml-1 text-gray-400">No reviews yet</span>
             )}
          </div>
          {time && (
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{time}</span>
            </div>
          )}
        </div>
        {/* Add main action button for viewing recipe */}
        {onViewRecipe && (
          <button
            className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm"
            onClick={() => onViewRecipe(id)}
          >
            View Recipe
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default RecipeCard;

