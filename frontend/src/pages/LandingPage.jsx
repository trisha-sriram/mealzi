// src/pages/LandingPage.js  <-- This is your "page"
import React, { useState } from 'react';

import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CTASection from '../components/CTASection';
import NavBar from '../components/Navbar';
import AuthModals from '../components/AuthModals';

function LandingPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const openSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  return (
    <>
      <NavBar />
      <HeroSection onGetStarted={openSignUp} />
      <FeaturesSection onGetStarted={openSignUp} />
      <AboutSection onGetStarted={openSignUp} />
      <HowItWorksSection />
      <CTASection onGetStarted={openSignUp} />
      
      {/* Auth Modals */}
      <AuthModals 
        showSignIn={showSignIn} 
        showSignUp={showSignUp}
        setShowSignIn={setShowSignIn}
        setShowSignUp={setShowSignUp}
      />
    </>
  );
}

export default LandingPage;