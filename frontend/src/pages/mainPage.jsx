import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-white">
                <div className="max-w-4xl">
                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-green-900 mb-6">
                        Your AI Therapy Companion
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto">
                        Experience compassionate, voice-activated therapy sessions powered by AI.
                        Available 24/7, completely private, and always understanding.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/voice')}
                            className="px-8 py-4 bg-green-600 text-white font-semibold text-lg rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            🎙️ Try Voice Therapy
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-white text-green-600 font-semibold text-lg rounded-full border-2 border-green-600 hover:bg-green-50 transition-all duration-300"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 bg-white text-green-600 font-semibold text-lg rounded-full border-2 border-green-600 hover:bg-green-50 transition-all duration-300"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 animate-bounce">
                    <svg className="w-6 h-6 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-50 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-green-900 mb-16">
                        Why Choose Buddi?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
                            <div className="text-5xl mb-4">🎙️</div>
                            <h3 className="text-xl font-bold text-green-900 mb-3">Voice-Activated</h3>
                            <p className="text-gray-700">
                                Natural conversation with AI that listens and responds just like a real therapist.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
                            <div className="text-5xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-green-900 mb-3">Private & Secure</h3>
                            <p className="text-gray-700">
                                Your conversations are completely confidential and protected with encryption.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
                            <div className="text-5xl mb-4">🌟</div>
                            <h3 className="text-xl font-bold text-green-900 mb-3">24/7 Availability</h3>
                            <p className="text-gray-700">
                                Get support whenever you need it, day or night, without appointments.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
                            <div className="text-5xl mb-4">💚</div>
                            <h3 className="text-xl font-bold text-green-900 mb-3">Empathetic AI</h3>
                            <p className="text-gray-700">
                                Warm, understanding responses that make you feel heard and supported.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-white py-16 px-6 text-center border-t-2 border-green-100">
                <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-6">
                    Ready to start your journey?
                </h2>
                <button
                    onClick={() => navigate('/voice')}
                    className="px-10 py-5 bg-green-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                    Start Free Session
                </button>
            </section>
        </div>
    );
};

export default MainPage;
