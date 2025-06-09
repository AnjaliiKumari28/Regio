import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { IoArrowBack } from "react-icons/io5";

const SERVER = import.meta.env.VITE_SERVER_URL;

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { seller } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [product, setProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${SERVER}/products-seller/get-product/${productId}`, {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                });
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };

        if (seller) {
            fetchProduct();
        }
    }, [productId, seller]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionChange = (varietyIndex, optionIndex, field, value) => {
        setProduct(prev => {
            const newProduct = { ...prev };
            newProduct.varieties[varietyIndex].options[optionIndex][field] = value;
            return newProduct;
        });
    };

    const handleVarietyTitleChange = (varietyIndex, value) => {
        setProduct(prev => {
            const newProduct = { ...prev };
            newProduct.varieties[varietyIndex].title = value;
            return newProduct;
        });
    };

    const handleToggleActive = () => {
        setProduct(prev => ({
            ...prev,
            isActive: !prev.isActive
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const updateData = {
                productName: product.productName,
                description: product.description,
                specifications: product.specifications,
                isActive: product.isActive,
                varieties: product.varieties.map(variety => ({
                    title: variety.title,
                    options: variety.options.map(option => ({
                        label: option.label,
                        price: parseFloat(option.price),
                        mrp: parseFloat(option.mrp),
                        quantity: parseInt(option.quantity)
                    })),
                    images: variety.images
                }))
            };

            await axios.put(`${SERVER}/products-seller/update-product/${productId}`, updateData, {
                headers: {
                    Authorization: `Bearer ${seller.token}`
                }
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/my-products');
            }, 2000);
        } catch (error) {
            console.error('Error updating product:', error.response?.data || error);
            setError('Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

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
            {success && (
                <div className="fixed w-full flex justify-center z-50 py-[100px]">
                    <h1 className="bg-hippie-green-300 px-5 py-2 rounded-lg border border-hippie-green-800 text-hippie-green-900 drop-shadow-2xl">
                        Product updated successfully
                    </h1>
                </div>
            )}
            <div className="w-full flex items-center justify-between px-5 md:px-10 py-2 bg-hippie-green-400 shadow-lg relative">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/my-products')}
                        className="flex items-center gap-2 text-hippie-green-800 hover:text-hippie-green-900"
                    >
                        <IoArrowBack size={20} />
                        <span>Back to Products</span>
                    </button>
                </div>
            </div>

            <div className="pt-10 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-hippie-green-900 mb-8">Edit Product</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                            <h2 className="text-xl font-semibold text-hippie-green-800">Basic Information</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={product.productName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={product.description}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                                <textarea
                                    name="specifications"
                                    value={product.specifications}
                                    onChange={handleInputChange}
                                    rows={10}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500 resize-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={product.isActive}
                                            onChange={handleToggleActive}
                                            className="sr-only"
                                        />
                                        <div className={`block w-14 h-8 rounded-full ${product.isActive ? 'bg-hippie-green-500' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${product.isActive ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-gray-700 font-medium">
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Product Type Information */}
                        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-hippie-green-800">Product Type Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Type</label>
                                    <p className="mt-1 text-gray-900">{product.productType?.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Category</label>
                                    <p className="mt-1 text-gray-900">{product.productCategory}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">State</label>
                                    <p className="mt-1 text-gray-900">{product.productType?.state}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">City</label>
                                    <p className="mt-1 text-gray-900">{product.productType?.city}</p>
                                </div>
                            </div>
                        </div>

                        {/* Varieties */}
                        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                            <h2 className="text-xl font-semibold text-hippie-green-800">Varieties</h2>
                            
                            {product.varieties.map((variety, varietyIndex) => (
                                <div key={varietyIndex} className="bg-hippie-green-50 p-4 rounded-lg">
                                    <div className="space-y-4">
                                        {/* Variety Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Variety Title</label>
                                            <input
                                                type="text"
                                                value={variety.title}
                                                onChange={(e) => handleVarietyTitleChange(varietyIndex, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500"
                                                required
                                            />
                                        </div>

                                        {/* Images */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-2">Images</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {variety.images.map((image, imageIndex) => (
                                                    <div key={imageIndex} className="relative group">
                                                        <img
                                                            src={image}
                                                            alt={`Image ${imageIndex + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                        <a
                                                            href={image}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                        >
                                                            <span className="text-white text-sm">View Full Size</span>
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Options */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-2">Options</h4>
                                            {variety.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="bg-white p-4 rounded-lg border border-hippie-green-200 mb-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                                            <input
                                                                type="text"
                                                                value={option.label}
                                                                onChange={(e) => handleOptionChange(varietyIndex, optionIndex, 'label', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={option.quantity}
                                                                onChange={(e) => handleOptionChange(varietyIndex, optionIndex, 'quantity', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={option.price}
                                                                onChange={(e) => handleOptionChange(varietyIndex, optionIndex, 'price', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={option.mrp}
                                                                onChange={(e) => handleOptionChange(varietyIndex, optionIndex, 'mrp', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-hippie-green-500 hover:bg-hippie-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct; 