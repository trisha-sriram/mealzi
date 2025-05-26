// src/pages/RecipeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RecipeCard from '../components/RecipeCard.jsx'; 
import PromoBannerCard from '../components/PromoBannerCard.jsx'; 
import RecipeDashboardHeader from '../components/RecipeDashboardHeader.jsx'; 
import RecipeForm from '../components/RecipeForm.jsx'; // This should be your complex modal form
import Footer from '../components/Footer.jsx';

// Footer is typically global in App.jsx.
// import Footer from '../components/Footer.jsx'; 

function RecipeDashboard() {
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showCreateRecipeModal, setShowCreateRecipeModal] = useState(false); // State for modal visibility

  const promoData = {
    backgroundImageUrl: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80", 
    title: "Take It Outside!",
    description: "All the recipes you need for your Memorial Day cookout, summer picnics and more.",
    buttonText: "Explore Summer Recipes",
    buttonLink: "/summer-recipes" 
  };

  useEffect(() => {
    const mockRecipeData = {
      id: 'recipe_of_the_day_123',
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      tag: "RECIPE OF THE DAY",
      title: "Grilled Salmon with Asparagus",
      author: "Chef Delia Smith",
      description: "A healthy and delicious grilled salmon served with fresh asparagus and a lemon-dill sauce. Perfect for a light dinner or a special occasion.",
      rating: 4.7,
      reviewCount: 123,
      time: "40 minutes",
    };
    setFeaturedRecipe(mockRecipeData);
  }, []);

  const handleToggleBookmark = () => {
    if (featuredRecipe) {
      setIsBookmarked(!isBookmarked);
      console.log(`Bookmark for recipe ${featuredRecipe.title} toggled to: ${!isBookmarked}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // TODO: Implement actual search logic
  };

  // Functions to control the Create Recipe Modal
  const openCreateRecipeModal = () => {
    console.log("Attempting to open Create Recipe Modal (showCreateRecipeModal will be true)"); // Debug log
    setShowCreateRecipeModal(true);
  }
  const closeCreateRecipeModal = () => {
    console.log("Attempting to close Create Recipe Modal (showCreateRecipeModal will be false)"); // Debug log
    setShowCreateRecipeModal(false);
  }

  const scrollFadeInVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    },
  };

  if (!featuredRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lime-50 pt-20">
        <p className="text-xl text-gray-600">Loading recipe dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-lime-50 min-h-screen pt-16 md:pt-20"> 
      <RecipeDashboardHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchSubmit={handleSearchSubmit}
          onOpenCreateRecipeModal={openCreateRecipeModal} // Pass the function to open the modal
        />
      <div className="container mx-auto px-4 py-8 space-y-12 md:space-y-16">
        <motion.div
          variants={scrollFadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <RecipeCard
            imageUrl={featuredRecipe.imageUrl}
            tag={featuredRecipe.tag}
            title={featuredRecipe.title}
            author={featuredRecipe.author}
            description={featuredRecipe.description}
            rating={featuredRecipe.rating}
            reviewCount={featuredRecipe.reviewCount}
            time={featuredRecipe.time}
            isBookmarked={isBookmarked}
            onBookmarkToggle={handleToggleBookmark}
          />
        </motion.div>

        <hr className="border-t-2 border-lime-200 my-12 md:my-16" /> 

        <motion.div
          variants={scrollFadeInVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <PromoBannerCard
            backgroundImageUrl={promoData.backgroundImageUrl}
            title={promoData.title}
            description={promoData.description}
            buttonText={promoData.buttonText}
            buttonLink={promoData.buttonLink}
          />
        </motion.div>
        
        {/* Redundant "Create Your Own Recipe" button at the bottom is removed */}
      </div>

      {/* Render the Modal Form, controlled by state */}
      {/* This assumes 'RecipeForm.jsx' is the complex modal version */}
      <RecipeForm
        showModal={showCreateRecipeModal}
        onClose={closeCreateRecipeModal}
      />

      <Footer />
      
      
    </div>
  );
}

export default RecipeDashboard;
