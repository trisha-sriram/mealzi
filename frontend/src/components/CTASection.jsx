import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function CtaSection({ onGetStarted }) {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 bg-gradient-to-br from-emerald-50 to-lime-100 overflow-hidden relative"
    >
      {/* Background elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-emerald-200"
          style={{
            width: `${Math.random() * 300 + 200}px`,
            height: `${Math.random() * 300 + 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3,
            zIndex: 0,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 0.3 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 1, delay: i * 0.2 }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left column - Image/Illustration */}
            <div className="relative bg-lime-100 p-8 lg:p-12 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-lime-200/50 to-emerald-100/50"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
              
              {/* Food illustrations floating */}
              {["🍅", "🥦", "🥕", "🍆", "🧄", "🥑"].map((emoji, index) => (
                <motion.div
                  key={index}
                  className="absolute text-4xl"
                  style={{
                    top: `${20 + index * 15}%`,
                    left: `${10 + (index % 3) * 25}%`,
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={isInView ? { 
                    y: [20, -20, 20], 
                    opacity: 1,
                    rotate: [0, 10, -10, 0],
                  } : { y: 20, opacity: 0 }}
                  transition={{
                    y: { duration: 5, delay: index * 0.2, repeat: Infinity },
                    opacity: { duration: 0.8, delay: index * 0.2 },
                    rotate: { duration: 5, delay: index * 0.2, repeat: Infinity }
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
              
              <motion.div
                className="relative z-10 flex flex-col items-center justify-center h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="text-center">
                  <h3 className="text-3xl font-bold font-cute text-emerald-900 mb-4">Ready to transform your cooking?</h3>
                  <p className="text-lg text-emerald-800 max-w-md">
                    Get personalized recipes based on what's already in your kitchen. Save time, reduce food waste, and discover new favorites.
                  </p>
                  
                  <motion.div 
                    className="mt-8 inline-block"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-white text-emerald-700 font-medium text-sm shadow-md">
                      <span className="mr-2">⭐</span>
                      Trusted by over 100 home cooks
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            {/* Right column - CTA form */}
            <div className="p-8 lg:p-12">
              <motion.div
                className="h-full flex flex-col justify-center"
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 font-cute">Ready to start cooking?</h3>
                  <p className="text-gray-600 mb-6">
                    Join our community of home cooks and discover amazing recipes tailored to your ingredients. Start creating delicious meals today!
                  </p>
                </div>
                
                <motion.form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    onGetStarted();
                  }}
                  className="space-y-4 mb-6"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <motion.button
                    type="submit"
                    className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Button shine effect */}
                    <motion.span 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -z-10"
                      initial={{ x: -100, opacity: 0 }}
                      whileHover={{ x: 200, opacity: 0.5 }}
                      transition={{ duration: 0.6 }}
                    />
                    Get Started Now
                  </motion.button>
                </motion.form>
                
                <div className="flex items-center space-x-4 justify-center">
                  {[1, 2, 3].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: 0.9 + (i * 0.1) }}
                    >
                      <div className="text-2xl mb-1">{["🚀", "✨", "🔥"][i]}</div>
                      <div className="text-xs text-gray-500">{["Fast Setup", "Easy to Use", "Save Money"][i]}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export both components
export default CtaSection;