import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
    const [seller, setSeller] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch seller from local storage on component mount
    useEffect(() => {
        setIsLoading(true);
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            setSeller(JSON.parse(storedSeller));
        }
        setIsLoading(false);
    }, []);
    useEffect(() => {
        console.log(seller);
    }, [seller]);

    return (
        <AuthContext.Provider value={{ seller, setSeller, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
