// src/components/PromoBannerCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

function PromoBannerCard({
  backgroundImageUrl,
  title,
  description,
  buttonText,
  buttonLink = "#",
  className,
}) {
  return (
    <motion.div
      className={`relative w-full h-80 md:h-96 rounded-2xl shadow-xl overflow-hidden group ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Image */}
      <img
        src={backgroundImageUrl || "https://placehold.co/1200x400/a3e635/4d7c0f?text=Summer+Recipes"}
        alt={title || "Promotional banner image"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/1200x400/fecaca/991b1b?text=Image+Error"; }}
      />
      {/* Overlay for better text readability (optional) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-start p-8 md:p-12 lg:p-16 max-w-xl md:max-w-2xl">
        <motion.h2 
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-cute leading-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {title || "Catchy Title Here!"}
        </motion.h2>
        <motion.p 
          className="text-base sm:text-lg text-gray-200 mb-6 leading-relaxed"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {description || "An engaging description about this promotion or recipe collection."}
        </motion.p>
        {buttonText && (
          <motion.a
            href={buttonLink}
            className="bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ boxShadow: "0px 10px 20px rgba(0,0,0,0.2)"}}
          >
            {buttonText}
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

export default PromoBannerCard;
