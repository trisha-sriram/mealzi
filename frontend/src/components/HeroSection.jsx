import food from '../assets/hero-section/food.png'
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function HeroSection({ onGetStarted }) {
    const constraintsRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    
    // Background circles with more variety
    const backgroundCircles = Array(8).fill(0).map((_, i) => ({
        size: Math.random() * 180 + 40,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        delay: Math.random() * 0.5,
        duration: Math.random() * 8 + 5,
        opacity: Math.random() * 0.3 + 0.05
    }));

    // Floating food emojis
    const foodEmojis = ["🥗", "🍲", "🥑", "🍅", "🥕", "🌽", "🍆", "🥦", "🍎", "🧀"];
    const floatingEmojis = Array(6).fill(0).map((_, i) => ({
        emoji: foodEmojis[i % foodEmojis.length],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 20 + 25,
        delay: Math.random() * 2,
        duration: Math.random() * 10 + 15
    }));

    return (
        <section 
            className="w-full h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-[#DCFCE7] via-[#BEF264] to-[#A3E635]/70 gap-6 overflow-hidden relative"
            ref={constraintsRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Animated background elements */}
            {backgroundCircles.map((circle, index) => (
                <motion.div
                    key={`circle-${index}`}
                    className="absolute rounded-full bg-white/20 backdrop-blur-sm border border-white/10"
                    style={{ 
                        width: circle.size, 
                        height: circle.size,
                        left: `${circle.x}%`,
                        top: `${circle.y}%`,
                        zIndex: 0
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                        scale: [0.8, 1.2, 0.9],
                        opacity: [0, circle.opacity, 0],
                        x: [0, -20, 20, 0],
                        y: [0, 30, -10, 0]
                    }}
                    transition={{ 
                        duration: circle.duration, 
                        delay: circle.delay,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                />
            ))}
            
            {/* Floating food emojis */}
            {floatingEmojis.map((item, index) => (
                <motion.div
                    key={`emoji-${index}`}
                    className="absolute text-4xl pointer-events-none z-10"
                    style={{ 
                        fontSize: item.size,
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                        opacity: [0, 0.9, 0],
                        y: [50, -100],
                        rotate: [0, 15, -15, 0],
                        scale: [0.7, 1.1, 0.7]
                    }}
                    transition={{ 
                        duration: item.duration,
                        delay: item.delay,
                        repeat: Infinity,
                        repeatType: "loop"
                    }}
                >
                    {item.emoji}
                </motion.div>
            ))}

            {/* Light beam effect */}
            <motion.div 
                className="absolute top-0 left-1/4 w-1/2 h-screen bg-gradient-to-b from-white/40 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ 
                    opacity: [0, 0.1, 0.2, 0.1, 0],
                    x: [-100, 0, 100]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />
            
            {/* Content section with improved layout */}
            <div className="w-full md:w-1/2 z-10 px-6 py-12 md:py-0">
                <motion.div 
                    className="flex flex-col items-center md:items-start gap-6 md:pl-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium text-emerald-900 flex items-center gap-2 border border-white/30 shadow-sm"
                    >
                        <span className="animate-pulse text-emerald-600">●</span> 
                        New! Recipe sharing and ingredients matching
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.7, ease: "easeOut"}} 
                        className="text-5xl md:text-7xl font-bold font-cute text-gray-900 leading-tight text-center md:text-left"
                    >
                        Cook Smart.{" "}
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="relative"
                        >
                            <span className="relative z-10">Eat Better.</span>
                            <motion.span 
                                className="absolute bottom-0 left-0 h-4 bg-yellow-300/60 w-full z-0"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            />
                        </motion.span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="font-cute text-xl md:text-2xl text-gray-800 text-center md:text-left"
                    >
                        Turn your ingredients into magic{" "}
                        <motion.span
                            animate={{
                                rotate: [0, 20, 0, -20, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 4
                            }}
                            className="inline-block"
                        >
                            ✨
                        </motion.span>
                    </motion.p>
                    
                    <motion.button 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        whileHover={{
                            scale: 1.02, 
                            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)"
                        }} 
                        whileTap={{ scale: 0.98 }} 
                        onClick={onGetStarted}
                        className="bg-white hover:bg-lime-100 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                        <motion.span
                            animate={{
                                rotate: [0, 0, -20, 20, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 6
                            }}
                        >
                            🍽️
                        </motion.span> 
                        Get Started for free
                    </motion.button>

                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 flex gap-4 items-center"
                    >
                        {["🥗", "🍲", "🥑"].map((emoji, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ 
                                    delay: 0.9 + (i * 0.15), 
                                    type: "spring", 
                                    stiffness: 300 
                                }}
                                whileHover={{ 
                                    y: -8, 
                                    rotate: 15, 
                                    scale: 1.2,
                                    transition: { duration: 0.2 }
                                }}
                                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-xl"
                            >
                                {emoji}
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.4 }}
                            className="flex items-center gap-1"
                        >
                            <span className="text-emerald-900 font-semibold">and</span>
                            <motion.span 
                                className="text-emerald-800 font-bold"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    repeatDelay: 5
                                }}
                            >
                                100+
                            </motion.span>
                            <span className="text-emerald-900 font-semibold">recipes</span>
                        </motion.div>
                    </motion.div>
                    
                    {/* User testimonial pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.5 }}
                        className="mt-4 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 border border-white/20"
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs">
                                    {["👩‍🍳", "👨‍🍳", "👩‍🍳"][i]}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <span className="text-emerald-900 font-semibold">50+</span> people cooking right now
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            
            {/* Image section with improved interaction */}
            <div className="w-full md:w-1/2 flex justify-center items-center z-10 relative py-8 md:py-0">
                <motion.div
                    className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px] flex items-center justify-center"
                    style={{ touchAction: "none" }}
                >
                    <motion.div
                        className="absolute -inset-6 bg-white/30 backdrop-blur-md rounded-3xl border border-white/30"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    />
                    
                    {/* Decorative elements around the image */}
                    {[1, 2, 3, 4].map((_, i) => (
                        <motion.div
                            key={`deco-${i}`}
                            className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-lime-300 flex items-center justify-center text-2xl"
                            style={{
                                top: `${[15, 75, 20, 70][i]}%`,
                                left: `${[10, 15, 85, 80][i]}%`,
                                zIndex: 5
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                                delay: 1 + (i * 0.2),
                                type: "spring"
                            }}
                        >
                            {["🌱", "🍕", "🍋", "🌶️"][i]}
                        </motion.div>
                    ))}
                    
                    <motion.img
                        src={food}
                        alt="Delicious food"
                        drag
                        dragConstraints={constraintsRef}
                        dragTransition={{ 
                            power: 0.2, 
                            timeConstant: 200,
                            modifyTarget: target => Math.round(target * 2) / 2 
                        }}
                        whileHover={{ 
                            scale: 1.05, 
                            rotate: 5,
                            filter: "brightness(1.1)"
                        }}
                        whileDrag={{ 
                            scale: 1.1, 
                            cursor: "grabbing", 
                            rotate: 8,
                            zIndex: 50
                        }}
                        initial={{ rotate: 5, scale: 0.9, opacity: 0 }}
                        animate={{
                            rotate: [5, 0, 3, 0],
                            y: [0, -8, 0, -4, 0],
                            scale: 1,
                            opacity: 1
                        }}
                        transition={{
                            duration: 6,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "mirror"
                        }}
                        style={{ 
                            width: 400,
                            maxWidth: "95%",
                            cursor: "grab",
                            zIndex: 10,
                            filter: "drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.15))"
                        }}
                    />
                    
                    {/* Animated shine effect on the image */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0, 0.5, 0],
                            rotate: [0, 180],
                            scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            repeatType: "loop"
                        }}
                    />

                    {/* "Drag me" indicator with better animation */}
                    <motion.div
                        className="absolute top-0 right-0 md:top-10 md:right-0 text-lg"
                        initial={{ opacity: 0, scale: 0, y: -20 }}
                        animate={{ 
                            opacity: isHovering ? 0 : 1, 
                            scale: isHovering ? 0 : 1,
                            y: isHovering ? -30 : 0 
                        }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <div className="relative">
                            {/* Better cloud shape */}
                            <svg width="140" height="70" viewBox="0 0 140 70" className="fill-white/90 drop-shadow-lg">
                                <path d="M25,5 C15,5 5,15 5,25 C5,35 15,45 25,45 L100,45 C115,45 135,35 135,55 C135,65 120,70 110,70 L30,70 C20,70 10,60 10,50 C10,40 20,30 30,30 C20,30 10,20 10,10 C10,5 15,0 25,0 Z" />
                            </svg>
                            
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{ 
                                    y: [0, -3, 0, 3, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                }}
                            >
                                <motion.span 
                                    className="font-cute text-emerald-900 text-sm font-bold flex items-center gap-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Drag me! 
                                    <motion.span
                                        animate={{
                                            rotate: [0, 10, -10, 10, 0],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                    >
                                        ✨
                                    </motion.span>
                                </motion.span>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            
            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
            >
                <motion.p className="text-sm text-emerald-900 font-medium mb-2">Scroll down</motion.p>
                <motion.div 
                    className="w-6 h-10 border-2 border-emerald-900 rounded-full flex justify-center items-start p-1"
                    animate={{ boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 8px rgba(0,0,0,0.2)", "0px 0px 0px rgba(0,0,0,0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <motion.div 
                        className="w-1.5 h-1.5 bg-emerald-900 rounded-full"
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    )
}

export default HeroSection;