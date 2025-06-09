import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../contexts/searchContext';
import Navbar from '../components/Navbar';
import { FaStar, FaChevronDown, FaFilter } from 'react-icons/fa';

const ProductList = () => {
    const { category, productType, query } = useParams();
    const navigate = useNavigate();
    const { results, loading, error, searchByCategory, searchByType, searchByQuery } = useSearch();
    const [selectedFilters, setSelectedFilters] = useState({
        sortBy: 'relevance',
        rating: null,
        priceRange: null
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    useEffect(() => {
        if (query) {
            searchByQuery(query);
        } else if (category) {
            searchByCategory(category);
        } else if (productType) {
            searchByType(productType);
        }
    }, [query, category, productType, searchByQuery, searchByCategory, searchByType]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFilterChange = (filter, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filter]: value
        }));
        setIsFilterOpen(false);
    };

    const getFilterLabel = () => {
        if (selectedFilters.rating) {
            return `${selectedFilters.rating}+ Stars`;
        }
        switch (selectedFilters.sortBy) {
            case 'priceLowToHigh':
                return 'Price: Low to High';
            case 'priceHighToLow':
                return 'Price: High to Low';
            case 'popularity':
                return 'Popularity';
            default:
                return 'Relevance';
        }
    };

    const filteredResults = results
        .filter(item => {
            if (selectedFilters.rating) {
                return item.rating >= parseInt(selectedFilters.rating);
            }
            return true;
        })
        .sort((a, b) => {
            switch (selectedFilters.sortBy) {
                case 'priceLowToHigh':
                    return a.price - b.price;
                case 'priceHighToLow':
                    return b.price - a.price;
                case 'popularity':
                    return b.ratingCount - a.ratingCount;
                default:
                    return 0;
            }
        });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-red-500 text-xl">{error}</div>
        </div>
    );

    if (results.length === 0) return (
        <>
            <Navbar showSearch={true} />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md text-center space-y-6">
                    <img 
                        src="/no-results.png" 
                        alt="No results found" 
                        className="w-64 h-64 object-contain mx-auto"
                    />
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            No Products Found
                        </h2>
                        <p className="text-gray-600">
                            {query 
                                ? `We couldn't find any products matching "${decodeURIComponent(query)}".` 
                                : category 
                                    ? `We couldn't find any products in the ${category} category.` 
                                    : productType 
                                        ? `We couldn't find any products of type ${productType}.`
                                        : "We couldn't find any products matching your search."}
                        </p>
                        <p className="text-gray-600">
                            Try adjusting your search or explore other categories.
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-hippie-green-600 text-white rounded-full hover:bg-hippie-green-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Navbar showSearch={true} showProfile={true}/>
            <div className='w-full min-h-screen bg-gray-50 pt-10'>
                <div className='w-full px-3 md:px-8 lg:px-10 py-8'>
                    <div className='flex flex-col gap-6'>
                        {/* Header and Filters */}
                        <div className='flex flex-col gap-4'>
                            <div className='flex items-center gap-4'>
                                <div ref={filterRef} className="relative">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-hippie-green-600 hover:text-hippie-green-600 transition-colors"
                                    >
                                        <FaFilter />
                                        <span className="font-medium">{getFilterLabel()}</span>
                                        <FaChevronDown className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isFilterOpen && (
                                        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
                                                    <div className="space-y-2">
                                                        {['relevance', 'popularity', 'priceLowToHigh', 'priceHighToLow'].map(option => (
                                                            <label 
                                                                key={option} 
                                                                className="flex items-center gap-2 cursor-pointer"
                                                                onClick={() => handleFilterChange('sortBy', option)}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="sortBy"
                                                                    checked={selectedFilters.sortBy === option}
                                                                    onChange={() => handleFilterChange('sortBy', option)}
                                                                    className="hidden peer"
                                                                />
                                                                <span className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:border-hippie-green-600 peer-checked:bg-hippie-green-600">
                                                                    {selectedFilters.sortBy === option && <span className="w-2 h-2 bg-white rounded-full"></span>}
                                                                </span>
                                                                <span className="text-sm text-gray-700">
                                                                    {option === 'priceLowToHigh' ? 'Price: Low to High' :
                                                                     option === 'priceHighToLow' ? 'Price: High to Low' :
                                                                     option.charAt(0).toUpperCase() + option.slice(1)}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Rating</h3>
                                                    <div className="space-y-2">
                                                        {['3', '4'].map(rating => (
                                                            <label 
                                                                key={rating} 
                                                                className="flex items-center gap-2 cursor-pointer"
                                                                onClick={() => handleFilterChange('rating', rating)}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="rating"
                                                                    checked={selectedFilters.rating === rating}
                                                                    onChange={() => handleFilterChange('rating', rating)}
                                                                    className="hidden peer"
                                                                />
                                                                <span className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:border-hippie-green-600 peer-checked:bg-hippie-green-600">
                                                                    {selectedFilters.rating === rating && <span className="w-2 h-2 bg-white rounded-full"></span>}
                                                                </span>
                                                                <span className="text-sm text-gray-700">{rating}+ Stars</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-8'>
                            {filteredResults.map((item) => (
                                <div
                                    onClick={() => {
                                        navigate(`/product/${item.productId}/${item.varietyId}`);
                                    }}
                                    key={item._id} 
                                    className='group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer'
                                >
                                    {/* Image Container */}
                                    <div className='relative aspect-square overflow-hidden'>
                                        {item.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={item.name}
                                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                                                    index === 0 ? 'opacity-100' : 'opacity-0'
                                                }`}
                                                onMouseEnter={(e) => {
                                                    let currentIndex = 0;
                                                    const totalImages = item.images.length;
                                                    
                                                    const switchImage = () => {
                                                        // Hide all images
                                                        item.images.forEach((_, i) => {
                                                            const img = e.target.parentElement.children[i];
                                                            img.style.opacity = '0';
                                                        });
                                                        
                                                        // Show current image
                                                        const currentImg = e.target.parentElement.children[currentIndex];
                                                        currentImg.style.opacity = '1';
                                                        
                                                        // Move to next image
                                                        currentIndex = (currentIndex + 1) % totalImages;
                                                        
                                                        // Schedule next switch
                                                        e.target.hoverInterval = setTimeout(switchImage, 1500);
                                                    };
                                                    
                                                    // Start the sequence
                                                    e.target.hoverInterval = setTimeout(switchImage, 500);
                                                }}
                                                onMouseLeave={(e) => {
                                                    // Clear the interval
                                                    clearTimeout(e.target.hoverInterval);
                                                    
                                                    // Reset to first image
                                                    item.images.forEach((_, i) => {
                                                        const img = e.target.parentElement.children[i];
                                                        img.style.opacity = i === 0 ? '1' : '0';
                                                    });
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Product Info */}
                                    <div className='p-3 sm:p-4 space-y-2'>
                                        <h3 className='text-sm text-gray-900 line-clamp-2 h-10 font-semibold'>
                                            {item.name}
                                        </h3>
                                        
                                        <div className='flex items-center justify-between pt-2'>
                                            <div className=' flex flex-col items-center gap-1'>
                                                <p className='text-base sm:text-lg font-semibold text-gray-900'>₹{item.price}</p>
                                                {item.mrp > item.price && (
                                                    <p className='text-xs text-gray-500 line-through'>₹{item.mrp}</p>
                                                )}
                                            </div>
                                            
                                            <div className='flex flex-col items-center gap-1'>
                                                <div className='flex items-center gap-1 bg-hippie-green-50 px-2 py-1 rounded-full'>
                                                    <span className='text-sm font-medium text-hippie-green-700'>{item.rating}</span>
                                                    <FaStar className='text-yellow-400 text-sm' />
                                                </div>
                                                <span className='text-xs text-gray-500'>({item.ratingCount})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductList;
