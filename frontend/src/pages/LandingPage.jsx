// src/pages/LandingPage.js  <-- This is your "page"
import React from 'react';

import AuthModels from '../components/AuthModals';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
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
      <AboutSection />
      <HowItWorksSection />
      <AuthModals />
      <CTASection />
      <Footer />
      
    </>
  );
}

export default LandingPage;