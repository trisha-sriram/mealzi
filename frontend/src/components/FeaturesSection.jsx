import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function FeaturesSection({ onGetStarted }) {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
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

  const features = [
    {
      icon: "🍳",
      title: "Smart Recipe Suggestions",
      description:
        "Get personalized recipe ideas based on ingredients you already have at home.",
    },
    {
      icon: "📊",
      title: "Nutrition Tracking",
      description:
        "Monitor calories, protein, and other nutrients to maintain a balanced diet.",
    },
    {
      icon: "🛒",
      title: "Grocery Lists",
      description:
        "Automatically generate shopping lists from your selected recipes.",
    },
    {
      icon: "⏱️",
      title: "Meal Planning",
      description:
        "Plan your meals for the week ahead and save time on daily decisions.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      className="w-full py-20 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-lime-100 text-emerald-700 text-sm font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Powerful Features
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold font-cute text-gray-900 mb-4">
            Everything you need to{" "}
            <span className="relative">
              cook smarter
              <motion.span 
                className="absolute -bottom-2 left-0 right-0 h-3 bg-lime-200 -z-10 rounded-sm"
                initial={{ width: 0 }}
                animate={isInView ? { width: "100%" } : { width: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-cute">
            Mealzi helps you save time, reduce food waste, and enjoy delicious healthy meals.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative group"
              variants={itemVariants}
            >
              {/* Feature Card Background Decoration */}
              <motion.div 
                className="absolute top-0 right-0 w-1/2 h-1/2 bg-lime-50 rounded-full opacity-0 group-hover:opacity-20 -z-10"
                initial={{ scale: 0 }}
                whileHover={{ scale: 2, rotate: 45 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Icon */}
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-50 to-lime-100 flex items-center justify-center text-3xl mb-5"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
              >
                {feature.icon}
              </motion.div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-cute">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-emerald-500 to-lime-500 text-white py-3 px-8 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Button shine effect */}
            <motion.span 
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -z-10"
              initial={{ x: -100, opacity: 0 }}
              whileHover={{ x: 200, opacity: 0.5 }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              Get Started Now
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <div className="w-full h-24 mt-20 overflow-hidden relative">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 74L60 63.8C120 54 240 34 360 32.7C480 32 600 49 720 57.2C840 65 960 63 1080 49.3C1200 36 1320 12 1380 0.3L1440 -11V75H1380C1320 75 1200 75 1080 75C960 75 840 75 720 75C600 75 480 75 360 75C240 75 120 75 60 75H0V74Z" 
                fill="#BEF264" fillOpacity="0.3"/>
        </svg>
      </div>
    </section>
  );
}

export default FeaturesSection;