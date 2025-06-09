import React from 'react'
import { Link } from 'react-router-dom'
import { IoLogOutOutline } from "react-icons/io5";

const Dashboard = () => {

  return (
    <div className="w-full min-h-screen flex flex-col gap-10 items-center">
      <div className="w-full flex items-center justify-between px-5 md:px-10 py-2 bg-hippie-green-400 shadow-lg relative">
        <img src={"/logoName.png"} className="h-10" alt="" />
        
      </div>

      <div className="xl:w-3/4 lg:w-3/4 md:w-11/12 w-11/12 flex flex-col items-center gap-8 my-5">
        <h1 className="text-3xl font-semibold text-hippie-green-700">
          Seller Dashboard
        </h1>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            to="/add-product-type"
            className="bg-hippie-green-100 rounded-lg shadow-lg overflow-hidden border border-hippie-green-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-hippie-green-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-hippie-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-hippie-green-800">Add New Product Type</h2>
            <p className="text-gray-600 text-center">Create and add new product types to your store</p>
          </Link>

          <Link 
            to="/all-product-types"
            className="bg-hippie-green-100 rounded-lg shadow-lg overflow-hidden border border-hippie-green-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-hippie-green-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-hippie-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-hippie-green-800">View All Product Types</h2>
            <p className="text-gray-600 text-center">Manage and view all your product types</p>
          </Link>

          <Link 
            to="/add-product"
            className="bg-hippie-green-100 rounded-lg shadow-lg overflow-hidden border border-hippie-green-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-hippie-green-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-hippie-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-hippie-green-800">Add New Product</h2>
            <p className="text-gray-600 text-center">Add new products to your store</p>
          </Link>

          <Link 
            to="/my-products"
            className="bg-hippie-green-100 rounded-lg shadow-lg overflow-hidden border border-hippie-green-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-hippie-green-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-hippie-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-hippie-green-800">My Products</h2>
            <p className="text-gray-600 text-center">View and manage your products</p>
          </Link>

          <Link 
            to="/orders"
            className="bg-hippie-green-100 rounded-lg shadow-lg overflow-hidden border border-hippie-green-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-hippie-green-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-hippie-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-hippie-green-800">Orders</h2>
            <p className="text-gray-600 text-center">View and manage your orders</p>
          </Link>

          <Link 
            to="/store"
            className="bg-hippie-green-100 rounded-lg shadow-lg overflow-hidden border border-hippie-green-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-hippie-green-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-hippie-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-hippie-green-800">My Store</h2>
            <p className="text-gray-600 text-center">View and manage your store details</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard