import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const SearchContext = createContext();
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

// Helper function to flatten product data
const flattenProduct = (product) => {
    // Create an array of flattened varieties
    return product.varieties.map(variety => {
        // Get the first option for price and mrp
        const firstOption = variety.options[0] || {};
        
        return {
            _id: `${product._id}${variety._id}`, // Unique ID for each variety
            productId: product._id,
            varietyId: variety._id,
            name: product.productName,
            varietyTitle: variety.title,
            images: variety.images,
            rating: product.rating,
            ratingCount: product.ratingCount,
            type: product.productTypeName,
            price: firstOption.price || 0,
            mrp: firstOption.mrp || 0,
        };
    });
};

export const SearchProvider = ({ children }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search by query
    const searchByQuery = useCallback(async (query) => {
        try {
            setLoading(true);
            setError(null);
            const encodedQuery = encodeURIComponent(query);
            const response = await axios.get(`${SERVER_URL}/search/query/${encodedQuery}`);
            const flattenedProducts = response.data.products.flatMap(flattenProduct);
            setResults(flattenedProducts);
        } catch (err) {
            setError(err.response?.data?.message || 'Error searching products');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Search by category
    const searchByCategory = useCallback(async (category) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${SERVER_URL}/search/category/${category}`);
            const flattenedProducts = response.data.products.flatMap(flattenProduct);
            setResults(flattenedProducts);
        } catch (err) {
            setError(err.response?.data?.message || 'Error searching products');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Search by product type
    const searchByType = useCallback(async (productType) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${SERVER_URL}/search/type/${productType}`);
            const flattenedProducts = response.data.products.flatMap(flattenProduct);
            setResults(flattenedProducts);
        } catch (err) {
            setError(err.response?.data?.message || 'Error searching products');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        results,
        loading,
        error,
        searchByQuery,
        searchByCategory,
        searchByType
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};
