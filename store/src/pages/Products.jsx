import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoAddCircleOutline, IoClose, IoStar } from "react-icons/io5";
import { MdModeEdit } from "react-icons/md";

const SERVER = import.meta.env.VITE_SERVER_URL;

const ProductCard = ({ product, onViewDetails }) => {
    const navigate = useNavigate();

    // Get the first available image from any variety
    const getFirstImage = () => {
        for (const variety of product.varieties) {
            if (variety.images && variety.images.length > 0) {
                return variety.images[0];
            }
        }
        return '/placeholder.jpg';
    };

    // Get the lowest price from all options
    const getLowestPrice = () => {
        let lowestPrice = Infinity;
        product.varieties.forEach(variety => {
            variety.options.forEach(option => {
                if (option.price < lowestPrice) {
                    lowestPrice = option.price;
                }
            });
        });
        return lowestPrice === Infinity ? 'N/A' : `₹${lowestPrice}`;
    };

    // Get all variety titles
    const getVarietyTitles = () => {
        return product.varieties.map(variety => variety.title).join(', ');
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 relative group cursor-pointer"
            onClick={() => onViewDetails(product)}
        >
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-product/${product._id}`);
                    }}
                    className="bg-hippie-green-500 hover:bg-hippie-green-600 text-white p-2 rounded-full shadow-md transition-colors"
                >
                    <MdModeEdit  />
                </button>
            </div>
            
            {/* Product Image */}
            <div className="aspect-square relative">
                <img 
                    src={getFirstImage()} 
                    alt={product.productName} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* Product Info */}
            <div className="p-4 z-20 relative bg-white">
                <h3 className="font-semibold text-lg text-hippie-green-800 mb-1">{product.productName}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                <p className="text-sm text-hippie-green-600 mb-2 line-clamp-1">{getVarietyTitles()}</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-hippie-green-600">{getLowestPrice()}</span>
                    <div className="flex items-center">
                        <IoStar className="text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{product.rating.toFixed(1)} ({product.ratingCount})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductDetailsModal = ({ product, onClose }) => {
    if (!product) return null;
    console.log('Product', product)

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-hippie-green-800">{product.productName}</h2>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-md"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-hippie-green-200">
                            <h3 className="text-lg font-semibold text-hippie-green-800 mb-2">Description</h3>
                            <p className="text-gray-600">{product.description}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-hippie-green-200">
                            <h3 className="text-lg font-semibold text-hippie-green-800 mb-2">Specifications</h3>
                            <p className="text-gray-600 whitespace-pre-line">{product.specifications}</p>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-white p-6 rounded-xl border border-hippie-green-200">
                        <h3 className="text-lg font-semibold text-hippie-green-800 mb-4">Product Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Type</span>
                                    <p className="text-gray-800 font-semibold">{product.productTypeName}</p>
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Category</span>
                                    <p className="text-gray-800 font-semibold">{product.productCategory}</p>
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Location</span>
                                    <p className="text-gray-800 font-semibold">{product.productType?.city}, {product.productType?.state}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Rating</span>
                                    <div className="flex items-center">
                                        <IoStar className="text-yellow-400 mr-1" />
                                        <span className="text-gray-800 font-semibold">{product.rating.toFixed(1)} ({product.ratingCount} ratings)</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Created</span>
                                    <p className="text-gray-800 font-semibold">{new Date(product.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600 block mb-1">Last Updated</span>
                                    <p className="text-gray-800 font-semibold">{new Date(product.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Varieties */}
                    <div className="bg-white p-6 rounded-xl border border-hippie-green-200">
                        <h3 className="text-lg font-semibold text-hippie-green-800 mb-4">Varieties</h3>
                        <div className="space-y-6">
                            {product.varieties.map((variety, index) => (
                                <div key={index} className="bg-hippie-green-50/50 p-6 rounded-xl">
                                    <h4 className="text-lg font-semibold text-hippie-green-800 mb-4">{variety.title}</h4>
                                    
                                    {/* Images */}
                                    <div className="mb-6">
                                        <h5 className="text-sm font-medium text-gray-600 mb-3">Images</h5>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {variety.images.map((image, imgIndex) => (
                                                <div key={imgIndex} className="aspect-square rounded-lg overflow-hidden group">
                                                    <img
                                                        src={image}
                                                        alt={`Image ${imgIndex + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        onClick={() => window.open(image, '_blank')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-600 mb-3">Options</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {variety.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="bg-white p-4 rounded-lg border border-hippie-green-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-hippie-green-800">{option.label}</span>
                                                        <span className="text-sm text-gray-500">Qty: {option.quantity}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-semibold text-hippie-green-800">
                                                            ₹{option.price}
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ₹{option.mrp}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();
    const { seller, isLoading, setSeller } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${SERVER}/products-seller/my-products?page=${currentPage}&limit=12`, {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                });
                setProducts(response.data.products);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to fetch products');
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        if(seller && !isLoading) {
            fetchProducts();
        }
    }, [seller, isLoading, navigate, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hippie-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hippie-green-50">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-hippie-green-50">
            <div className="w-full flex items-center justify-between px-5 md:px-10 py-2 bg-hippie-green-400 shadow-lg relative">
            <Link to="/home"><img src={"/logoName.png"} className="h-10" alt="" /></Link>
            </div>

            <div className="pt-10 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between flex-wrap gap-5 items-center mb-8">
                        <h1 className="text-2xl font-bold text-hippie-green-900">My Products</h1>
                        <button 
                            onClick={() => navigate('/add-product')}
                            className="flex items-center gap-2 bg-hippie-green-500 hover:bg-hippie-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <IoAddCircleOutline className="text-xl" />
                            <span>Add New Product</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                onViewDetails={setSelectedProduct}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-hippie-green-400 rounded-lg text-hippie-green-800 hover:bg-hippie-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-hippie-green-800">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-hippie-green-400 rounded-lg text-hippie-green-800 hover:bg-hippie-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            {selectedProduct && (
                <ProductDetailsModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </div>
    );
};

export default Products; 