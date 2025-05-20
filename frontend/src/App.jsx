import './App.css'
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import FeaturesSection from './components/FeaturesSection.jsx';
import HowItWorksSection from './components/HowItWorksSection.jsx';
import CtaSection from './components/CTASection.jsx';
import Footer from './components/Footer.jsx';

function App() {

  return (
      <div className="App">
          <Navbar />
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <CtaSection />
          <Footer />
      </div>
  )
}

export default App
