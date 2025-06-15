import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-hippie-green-400 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <img src="/logoName.png" alt="Regio" className="h-12" />
                        <p className="text-hippie-green-100 text-sm">
                            Crafted by Regions, Connected by Stories. Discover authentic products from local artisans and businesses across India.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-hippie-green-100 hover:text-white transition-colors">
                                <FaFacebook size={20} />
                            </a>
                            <a href="#" className="text-hippie-green-100 hover:text-white transition-colors">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-hippie-green-100 hover:text-white transition-colors">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-hippie-green-100 hover:text-white transition-colors">
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-hippie-green-100 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/search/category/Clothing" className="text-hippie-green-100 hover:text-white transition-colors">
                                    Clothing
                                </Link>
                            </li>
                            <li>
                                <Link to="/search/category/Accessories" className="text-hippie-green-100 hover:text-white transition-colors">
                                    Accessories
                                </Link>
                            </li>
                            <li>
                                <Link to="/search/category/Foods" className="text-hippie-green-100 hover:text-white transition-colors">
                                    Foods
                                </Link>
                            </li>
                            <li>
                                <Link to="/search/category/HandiCrafts" className="text-hippie-green-100 hover:text-white transition-colors">
                                    HandiCrafts
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/profile" className="text-hippie-green-100 hover:text-white transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-hippie-green-100 hover:text-white transition-colors">
                                    Shopping Cart
                                </Link>
                            </li>
                            <li>
                                <Link to="/wishlist" className="text-hippie-green-100 hover:text-white transition-colors">
                                    Wishlist
                                </Link>
                            </li>
                            <li>
                                <Link to="/checkout" className="text-hippie-green-100 hover:text-white transition-colors">
                                    Checkout
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <FaMapMarkerAlt className="mt-1 text-hippie-green-300" />
                                <span className="text-hippie-green-100">
                                    123 Regional Street,<br />
                                    New Delhi, India - 110001
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FaPhone className="text-hippie-green-300" />
                                <span className="text-hippie-green-100">+91 123 456 7890</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FaEnvelope className="text-hippie-green-300" />
                                <span className="text-hippie-green-100">support@regio.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-hippie-green-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-hippie-green-100 text-sm">
                            © {new Date().getFullYear()} Regio. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <Link to="/privacy-policy" className="text-hippie-green-100 hover:text-white text-sm transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms-of-service" className="text-hippie-green-100 hover:text-white text-sm transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/shipping-policy" className="text-hippie-green-100 hover:text-white text-sm transition-colors">
                                Shipping Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 