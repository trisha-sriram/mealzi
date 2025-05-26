// src/pages/LandingPage.js  <-- This is your "page"
import React from 'react';

import AuthModels from '../components/AuthModals';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CTASection from '../components/CTASection';
import NavBar from '../components/Navbar';
import AuthModals from '../components/AuthModals';

function LandingPage() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AuthModals />
      <CTASection />
      <Footer />
      
    </>
  );
}

export default LandingPage;