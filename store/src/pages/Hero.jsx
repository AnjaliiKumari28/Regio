import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaMapMarkerAlt, FaHandshake, FaUsers, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const Hero = () => {
  const aboutRef = useRef(null);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-hippie-green-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <img src="/logoName.png" alt="Regio" className="h-10" />
          <div className="space-x-6">
            <Link to="/login" className="text-gray-700 hover:text-hippie-green-700 transition-colors">Login</Link>
            <Link to="/register" className="bg-hippie-green-600 text-white px-6 py-2 rounded-full hover:bg-hippie-green-800 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-12 lg:mb-0 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Showcase Your <span className="text-hippie-green-500">Regional Treasures</span> to the World
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join India's premier platform for authentic local, regional, and traditional products. Connect with customers who value heritage and craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/home" className="bg-hippie-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-hippie-green-700 transition-colors text-center transform hover:scale-105">
                Start Selling
              </Link>
              <button onClick={scrollToAbout} className="border-2 border-hippie-green-600 text-hippie-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-hippie-green-50 transition-colors text-center transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>

          <div className="lg:w-1/3 transform transition-transform hover:scale-105">
            <img 
              src="/hero.jpg" 
              alt="Traditional Indian Products" 
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-transform hover:-translate-y-2 hover:shadow-xl border border-hippie-green-100">
            <FaStore className="text-4xl text-hippie-green-700 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Store Setup</h3>
            <p className="text-gray-600">Create your online store in minutes and start selling your regional products immediately.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-transform hover:-translate-y-2 hover:shadow-xl border border-hippie-green-100">
            <FaMapMarkerAlt className="text-4xl text-hippie-green-700 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Regional Focus</h3>
            <p className="text-gray-600">Connect with customers who specifically seek out authentic regional products from across India.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-transform hover:-translate-y-2 hover:shadow-xl border border-hippie-green-100">
            <FaHandshake className="text-4xl text-hippie-green-700 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trusted Platform</h3>
            <p className="text-gray-600">Join a community of verified sellers and build your brand with our secure platform.</p>
          </div>
        </div>

        {/* About Platform Section */}
        <div ref={aboutRef} className="mt-32 space-y-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-hippie-green-800 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're dedicated to preserving and promoting India's rich cultural heritage through its traditional products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-hippie-green-100 p-3 rounded-full">
                  <FaUsers className="text-2xl text-hippie-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-hippie-green-800 mb-2">Growing Community</h3>
                  <p className="text-gray-600">Join thousands of sellers and buyers who are passionate about preserving regional traditions and supporting local artisans.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-hippie-green-100 p-3 rounded-full">
                  <FaShieldAlt className="text-2xl text-hippie-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-hippie-green-800 mb-2">Secure Transactions</h3>
                  <p className="text-gray-600">Our platform ensures safe and secure transactions with multiple payment options and buyer protection policies.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-hippie-green-100 p-3 rounded-full">
                  <FaChartLine className="text-2xl text-hippie-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-hippie-green-800 mb-2">Growth Opportunities</h3>
                  <p className="text-gray-600">Access tools and insights to help your business grow, from analytics to marketing support and customer engagement features.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-hippie-green-100">
                  <h4 className="text-lg font-semibold text-hippie-green-800 mb-2">Wide Reach</h4>
                  <p className="text-gray-600 text-sm">Connect with customers across India and globally who appreciate authentic regional products.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-hippie-green-100">
                  <h4 className="text-lg font-semibold text-hippie-green-800 mb-2">Easy Management</h4>
                  <p className="text-gray-600 text-sm">Simple tools to manage your inventory, orders, and customer communications.</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-hippie-green-100">
                  <h4 className="text-lg font-semibold text-hippie-green-800 mb-2">Support System</h4>
                  <p className="text-gray-600 text-sm">Dedicated support team to help you with any questions or issues.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-hippie-green-100">
                  <h4 className="text-lg font-semibold text-hippie-green-800 mb-2">Brand Building</h4>
                  <p className="text-gray-600 text-sm">Tools and features to help you build and promote your brand effectively.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to="/register" className="inline-block bg-hippie-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-hippie-green-700 transition-colors transform hover:scale-105">
              Join Our Community Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
