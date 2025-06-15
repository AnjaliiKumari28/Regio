import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-24 w-24 rounded-full bg-hippie-green-100 animate-pulse"></div>
                        </div>
                        <FaExclamationTriangle className="relative mx-auto h-16 w-16 text-hippie-green-600" />
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Oops! The page you're looking for seems to have vanished into thin air.
                    Let's get you back on track!
                </p>

                {/* Action Button */}
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-hippie-green-600 hover:bg-hippie-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500 transition-colors duration-200"
                >
                    <FaHome className="mr-2" />
                    Back to Home
                </Link>

                {/* Decorative Elements */}
                <div className="mt-12 space-y-4">
                    <div className="flex justify-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-hippie-green-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="h-2 w-2 rounded-full bg-hippie-green-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 rounded-full bg-hippie-green-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 