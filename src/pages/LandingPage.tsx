import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { FaCheckCircle, FaChartBar, FaPencilAlt } from 'react-icons/fa';
import logo from "../assets/new zrveys logo.png";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle, error } = useAuth();

  const handleGetStarted = async () => {
    if (!currentUser) {
      try {
        await signInWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to sign in:', error);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#264F79] backdrop-blur">
        <div className="flex justify-between items-center p-4">
          <div>
            <img src={logo} alt="Zrveys" className="h-[5.4rem]" />
          </div>
          <div className="flex gap-4">
            {currentUser && (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={handleGetStarted}
              className="bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              {currentUser ? 'Create Survey' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          {error && (
            <div className="bg-red-500 text-red-500 border border-red-500 px-4 py-3 rounded-lg mb-8 max-w-2xl mx-auto">
              {error}
            </div>
          )}
          <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Create Beautiful Surveys
              <br />
              in Minutes
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl">
              Design engaging surveys, collect responses, and analyze results with our
              intuitive survey builder.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Start Creating for Free
            </button>
          </main>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-24 w-full bg-primary py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Why Choose Zrveys?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="text-secondary text-4xl mb-4 flex justify-center">
                <FaPencilAlt />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Easy to Create
              </h3>
              <p className="text-slate-300">
                Intuitive drag-and-drop interface makes survey creation a breeze.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="text-secondary text-4xl mb-4 flex justify-center">
                <FaCheckCircle />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Beautiful Design
              </h3>
              <p className="text-slate-300">
                Professional-looking surveys that engage your audience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="text-secondary text-4xl mb-4 flex justify-center">
                <FaChartBar />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Powerful Analytics
              </h3>
              <p className="text-slate-300">
                Get insights from your responses with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full">
            <div className="bg-slate-700/50 rounded-lg p-6">
              <div className="text-secondary text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Sign Up
              </h3>
              <p className="text-slate-300">
                Create your account in seconds with Google Sign-In.
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-6">
              <div className="text-secondary text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Create Your Survey
              </h3>
              <p className="text-slate-300">
                Design your survey using our intuitive builder.
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-6">
              <div className="text-secondary text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Share & Analyze
              </h3>
              <p className="text-slate-300">
                Share your survey and analyze responses in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Create Your First Survey?
          </h2>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-secondary text-white text-lg rounded-lg hover:bg-secondary-dark transition-colors"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© {new Date().getFullYear()} Zrveys. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
