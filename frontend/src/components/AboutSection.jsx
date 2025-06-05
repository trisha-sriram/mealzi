import { motion } from "framer-motion";

function AboutSection({ onGetStarted }) {
    return (
        <section id="about" className="py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <motion.h2 
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        About <span className="text-emerald-600">Mealzi</span>
                    </motion.h2>
                    <motion.p 
                        className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Born from a passion for healthy eating and smart cooking, Mealzi transforms how you manage your recipes and plan your meals.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Story Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            <p>
                                We believe that great meals start with great planning. Mealzi was created to bridge the gap between 
                                having amazing recipe ideas and actually bringing them to life in your kitchen.
                            </p>
                            <p>
                                Our platform combines the joy of discovering new recipes with the practicality of nutrition tracking, 
                                smart ingredient management, and personalized meal planning that fits your lifestyle.
                            </p>
                            <p>
                                Whether you're a busy professional looking for quick weeknight dinners, a fitness enthusiast tracking 
                                macros, or a family wanting to try new cuisines together, Mealzi adapts to your needs.
                            </p>
                        </div>
                    </motion.div>

                    {/* Values Grid */}
                    <motion.div 
                        className="grid sm:grid-cols-2 gap-6"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        {[
                            {
                                icon: "🍽️",
                                title: "Simplicity First",
                                description: "Clean, intuitive design that makes recipe management effortless and enjoyable."
                            },
                            {
                                icon: "📊",
                                title: "Nutrition Focused",
                                description: "Comprehensive nutritional insights to help you make informed food choices."
                            },
                            {
                                icon: "🎯",
                                title: "Personalized",
                                description: "Tailored recommendations based on your dietary preferences and goals."
                            },
                            {
                                icon: "🌱",
                                title: "Sustainable",
                                description: "Promoting healthy eating habits that benefit both you and the environment."
                            }
                        ].map((value, index) => (
                            <motion.div
                                key={value.title}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="text-3xl mb-4">{value.icon}</div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Stats Section */}
                <motion.div 
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    {[
                        { number: "100+", label: "Recipes Available", icon: "📝" },
                        { number: "50+", label: "Happy Users", icon: "😊" },
                        { number: "500+", label: "Meals Planned", icon: "🗓️" }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="text-center bg-white rounded-2xl p-8 shadow-lg"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="text-4xl mb-4">{stat.icon}</div>
                            <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                            <div className="text-gray-600 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div 
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Cooking?</h3>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join home cooks who have already discovered the joy of organized, nutritious meal planning.
                    </p>
                    <motion.button
                        onClick={onGetStarted}
                        className="bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Your Journey
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}

export default AboutSection; 