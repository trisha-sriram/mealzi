import food from '../assets/hero-section/food.png'
import { motion } from "framer-motion";
import { useRef } from "react";

function HeroSection() {
    const constraintsRef = useRef(null);

    return (
        <section className="w-full h-screen flex flex-row items-center justify-center bg-[#BEF264]/60 gap-6" ref={constraintsRef}>
            <div className="w-1/2">
                <div className="flex flex-col items-start gap-6 md:pl-16">
                    <motion.h1 initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 , ease: "easeInOut"}} className="text-5xl md:text-6xl font-bold font-cute text-gray-900 leading-tight">
                        Cook Smart. Eat Better.
                    </motion.h1>
                    <p className="font-cute text-2xl text-gray-800">
                        Turn your ingredients into magic ✨
                    </p>
                    <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.95}} className="bg-white text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#BEF264] transition">🍽️ Get Started for free</motion.button>
                </div>
            </div>
            <div className="w-1/2 flex justify-center items-center">
                <motion.div
                    className="relative w-[500px] h-[500px] flex items-center justify-center rounded-xl"
                    style={{ touchAction: "none" }}
                >
                    <motion.img
                        src={food}
                        alt="food"
                        drag
                        dragConstraints={constraintsRef}
                        dragTransition={{ 
                            power: 0.1, 
                            timeConstant: 200,
                            modifyTarget: target => Math.round(target * 2) / 2 
                        }}
                        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                        initial={{ rotate: 12 }}
                        style={{ 
                            width: 550,
                            cursor: "grab",
                            zIndex: 10
                        }}
                    />
                </motion.div>
            </div>
        </section>
    )
}

export default HeroSection;