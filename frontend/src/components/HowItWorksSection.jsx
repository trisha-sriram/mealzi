import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function HowItWorksSection() {
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

  const steps = [
    {
      number: "01",
      title: "Add your ingredients",
      description: "Scan your kitchen or manually enter the ingredients you have on hand.",
      icon: "🧅",
      color: "from-cyan-50 to-cyan-100",
      decorationPosition: "top-10 right-10"
    },
    {
      number: "02",
      title: "Discover recipes",
      description: "Browse personalized recipe suggestions based on your available ingredients.",
      icon: "🍲",
      color: "from-amber-50 to-amber-100",
      decorationPosition: "bottom-10 left-10"
    },
    {
      number: "03",
      title: "Cook with guidance",
      description: "Follow step-by-step instructions with timers and technique videos.",
      icon: "👩‍🍳",
      color: "from-emerald-50 to-emerald-100",
      decorationPosition: "top-10 left-10"
    },
    {
      number: "04",
      title: "Track & share",
      description: "Save favorites, track nutrition, and share your culinary creations.",
      icon: "📱",
      color: "from-purple-50 to-purple-100",
      decorationPosition: "bottom-10 right-10"
    }
  ];

  return (
    <section ref={sectionRef} className="w-full py-20 bg-gradient-to-b from-lime-50/50 to-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-lime-100/30"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: 0
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? {
              scale: [0, 1, 0.8],
              opacity: [0, 0.3, 0],
              x: [0, Math.random() * 60 - 30],
              y: [0, Math.random() * 60 - 30]
            } : { scale: 0, opacity: 0 }}
            transition={{
              duration: Math.random() * 5 + 5,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Simple Process
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold font-cute text-gray-900 mb-4">
            How Mealzi{" "}
            <motion.span
              className="relative inline-block"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              works
              <motion.svg
                className="absolute -bottom-2 w-full"
                height="12"
                viewBox="0 0 100 12"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <path
                  d="M0 8C20 -2 50 16 100 0"
                  stroke="#BEF264"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </motion.svg>
            </motion.span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-cute">
            Get from hungry to happy in four simple steps. No more wondering what to cook tonight.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              {/* Step Card */}
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden h-full border border-gray-100"
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Background decoration */}
                <motion.div
                  className={`absolute w-40 h-40 rounded-full bg-gradient-to-br ${step.color} -z-10 opacity-50 ${step.decorationPosition}`}
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Step number */}
                <span className="text-5xl font-bold text-gray-100">{step.number}</span>

                {/* Icon */}
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mb-5 mt-3"
                  whileHover={{ 
                    rotate: [0, -5, 5, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {step.icon}
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-cute">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
              
              {/* Connection line (only show between cards) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 z-10">
                  <motion.div 
                    className="h-0.5 w-full bg-lime-300"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;