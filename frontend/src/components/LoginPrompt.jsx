import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const LoginPrompt = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleBackToHome = () => {
    onClose();
    // Try to go back, if not possible (no history), go to home
    try {
      navigate(-1);
    } catch (error) {
      navigate('/');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-hippie-green-100 mb-4">
            <svg className="h-6 w-6 text-hippie-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-sm text-gray-500 mb-6">
            Please login to access this feature.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hippie-green-600 hover:bg-hippie-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500"
            >
              Login Now
            </Link>
            <button
              onClick={handleClose}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt; 