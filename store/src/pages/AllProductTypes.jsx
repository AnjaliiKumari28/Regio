import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { IoArrowBack, IoClose } from "react-icons/io5";

const AllProductTypes = () => {
    const [productTypes, setProductTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProductType, setSelectedProductType] = useState(null);
    const SERVER = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate();

    useEffect(() => {
        fetchProductTypes();
    }, []);

    const fetchProductTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${SERVER}/product-types`);
            if (response.data) {
                setProductTypes(response.data);
            }
        } catch (error) {
            console.error("Error fetching product types:", error);
            setError("Failed to load product types. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleProductTypeClick = (productType) => {
        setSelectedProductType(productType);
    };

    const handleClosePopup = () => {
        setSelectedProductType(null);
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
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchProductTypes}
                        className="px-4 py-2 bg-hippie-green-600 text-white rounded-lg hover:bg-hippie-green-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-hippie-green-50">
            {/* Header */}
            <div className="w-full flex items-center justify-between px-5 md:px-10 py-2 bg-hippie-green-400 shadow-lg relative">
                <div className="flex items-center gap-4">
                    <Link to="/home"><img src={"/logoName.png"} className="h-10" alt="" /></Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-10 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-hippie-green-900 mb-8 text-center">
                        All Product Types
                    </h1>

                    {/* Product Types Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productTypes.map((productType) => (
                            <div
                                key={productType._id}
                                onClick={() => handleProductTypeClick(productType)}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                            >
                                {/* Product Type Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={productType.image}
                                        alt={productType.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white text-lg font-semibold truncate">
                                            {productType.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Product Type Info */}
                                <div className="p-4">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="px-2 py-1 bg-hippie-green-100 text-hippie-green-800 rounded-full text-xs">
                                            {productType.category}
                                        </span>
                                        <span className="px-2 py-1 bg-hippie-green-100 text-hippie-green-800 rounded-full text-xs">
                                            {productType.state}, {productType.city}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                        {productType.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Product Types Message */}
                    {productTypes.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No product types found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Type Details Popup */}
            {selectedProductType && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-[100]">
                            <h2 className="text-xl font-semibold text-hippie-green-800">
                                {selectedProductType.name}
                            </h2>
                            <button
                                onClick={handleClosePopup}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Type Image */}
                            <div className="relative h-96 overflow-hidden rounded-lg">
                                <img
                                    src={selectedProductType.image}
                                    alt={selectedProductType.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Product Type Details */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-hippie-green-800 mb-2">Description</h3>
                                    <p className="text-gray-600">{selectedProductType.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-hippie-green-100 text-hippie-green-800 rounded-full text-sm">
                                        {selectedProductType.category}
                                    </span>
                                    <span className="px-3 py-1 bg-hippie-green-100 text-hippie-green-800 rounded-full text-sm">
                                        {selectedProductType.state}, {selectedProductType.city}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-hippie-green-800 mb-2">History</h3>
                                    <p className="text-gray-600">{selectedProductType.history}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllProductTypes; 