import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import config from '../config';

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
            } else {
                setSubmitStatus('error');
                console.error('Submit error:', result.error);
            }
        } catch (error) {
            setSubmitStatus('error');
            console.error('Network error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Get in <span className="text-emerald-600">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Have questions, feedback, or need help? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="pb-24">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Let's Connect</h2>
                                <p className="text-gray-600 leading-relaxed mb-8">
                                    Whether you have a question about features, need help with your account, or want to share feedback about your Mealzi experience, we're here to help.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: "📧",
                                        title: "Email Support",
                                        description: "Get help with technical issues or account questions",
                                        contact: "support@mealzi.com"
                                    },
                                    {
                                        icon: "💬",
                                        title: "General Inquiries",
                                        description: "Questions about Mealzi or partnerships",
                                        contact: "hello@mealzi.com"
                                    },
                                    {
                                        icon: "🚀",
                                        title: "Feature Requests",
                                        description: "Have an idea for improving Mealzi?",
                                        contact: "feedback@mealzi.com"
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.title}
                                        className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <div className="text-2xl">{item.icon}</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                            <p className="text-emerald-600 font-medium">{item.contact}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="bg-white rounded-2xl shadow-xl p-8"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                            
                            {submitStatus === 'success' && (
                                <motion.div 
                                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-green-600">✅</span>
                                        <p className="text-green-800 font-medium">Message sent successfully!</p>
                                    </div>
                                    <p className="text-green-600 text-sm mt-1">We'll get back to you within 24 hours.</p>
                                </motion.div>
                            )}

                            {submitStatus === 'error' && (
                                <motion.div 
                                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-red-600">❌</span>
                                        <p className="text-red-800 font-medium">Failed to send message</p>
                                    </div>
                                    <p className="text-red-600 text-sm mt-1">Please try again or email us directly.</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="What's this about?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                                        placeholder="Tell us more about your question or feedback..."
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                                        isSubmitting 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-emerald-600 to-lime-500 hover:shadow-lg'
                                    } text-white`}
                                    whileHover={isSubmitting ? {} : { y: -2 }}
                                    whileTap={isSubmitting ? {} : { scale: 0.98 }}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </div>
                                    ) : (
                                        'Send Message'
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default ContactPage; 