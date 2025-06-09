import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Hero from './pages/Hero';
import Dashboard from './pages/Dashboard';
import AddProductType from './pages/AddProductType';
import AllProductTypes from './pages/AllProductTypes';
import AddProduct from './pages/AddProduct';
import { AuthProvider, useAuth } from './contexts/authContext';
import Store from './pages/Store';
import Products from './pages/Products';
import EditProduct from './pages/EditProduct';
const ProtectedRoute = () => {
  const { seller, isLoading } = useAuth();

  // If there's no seller in the context, redirect to login
  if (!seller && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Hero />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/home' element={<Dashboard />} />
            <Route path='/add-product-type' element={<AddProductType />} />
            <Route path='/all-product-types' element={<AllProductTypes />} />
            <Route path='/add-product' element={<AddProduct />} />
            <Route path='/store' element={<Store />} />
            <Route path='/my-products' element={<Products />} />
            <Route path='/edit-product/:productId' element={<EditProduct />} />
          </Route>
          
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App


// array which will store all todos

// design