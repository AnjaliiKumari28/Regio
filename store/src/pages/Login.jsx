import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/authContext';
import axios from 'axios';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { setSeller } = useAuth();
    const SERVER = import.meta.env.VITE_SERVER_URL;

    // Get the redirect path from location state or default to dashboard
    const from = location.state?.from || '/regio-store';

    const initialValues = {
        email: '',
        password: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    });

    const handleLogin = async (values, { setFieldError }) => {
        setLoading(true);
        try {
            // Call the backend login API using axios
            const response = await axios.post(`${SERVER}/seller-auth/login`, values);
            
            // Login successful
            console.log('Login successful:', response.data);
            
            // Create seller object with token
            const sellerData = {
                id: response.data.seller.id,
                token: response.data.seller.token,
            };
            
            // Store in localStorage
            localStorage.setItem('seller', JSON.stringify(sellerData));
            
            // Update context
            setSeller(sellerData);
            
            // Navigate to the page they tried to visit or dashboard
            navigate('/home');
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific error messages from the backend
            if (error.response) {
                const errorMessage = error.response.data.error;
                
                if (errorMessage === 'No seller found with this email') {
                    setFieldError('email', 'Email not registered');
                } else if (errorMessage === 'Invalid credentials') {
                    setFieldError('password', 'Incorrect password');
                } else {
                    setFieldError('password', errorMessage || 'Login failed. Try again.');
                }
            } else {
                setFieldError('password', 'Login failed. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center gap-10 justify-center">
            

            <div className='w-full flex items-center justify-between xl:px-10 lg:px-10 md:px-8 px-2 py-2 bg-hippie-green-400 shadow-lg fixed top-0 z-50'>
                <img src={'/logoName.png'} className='xl:h-10 lg:h-10 md:h-10 h-6 relative top-1' alt="" />
            </div>

            <div className='xl:w-1/3 lg:w-1/2 md:w-8/12 w-11/12 flex flex-col items-start justify-center xl:px-10 lg:px-10 md:px-10 px-5 py-10 bg-hippie-green-100 gap-5 rounded-xl drop-shadow-xl border my-20'>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleLogin}
                >
                    {() => (
                        <Form className='w-full flex flex-col items-end gap-10'>
                            <h1 className='text-3xl font-bold text-hippie-green-700 w-full'>Seller Login</h1>

                            {/* Email Field */}
                            <label className='w-full flex flex-col items-start gap-2'>
                                <span className='font-medium text-gray-600 text-md'>Email</span>
                                <Field name="email" type="text"
                                    className='w-full px-2 py-2 border border-hippie-green-400 rounded-md bg-hippie-green-50 focus:outline-none' />
                                <ErrorMessage name="email" component="p" className='text-sm font-semibold text-red-500' />
                            </label>

                            {/* Password Field */}
                            <label className='w-full flex flex-col items-start gap-2'>
                                <span className='font-medium text-gray-600 text-md'>Password</span>
                                <div className='w-full px-2 py-2 border border-hippie-green-400 rounded-md bg-hippie-green-50 flex items-center justify-between gap-2'>
                                    <Field name="password" type={showPass ? 'text' : 'password'}
                                        className='w-full bg-transparent focus:outline-none' />
                                    <button type='button' onClick={() => setShowPass(!showPass)} className='text-hippie-green-600 text-xl'>
                                        {showPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <ErrorMessage name="password" component="p" className='text-sm font-semibold text-red-500' />
                            </label>

                            <button type="submit" className='bg-hippie-green-600 text-white text-lg font-semibold py-2 px-10 rounded-lg mt-5'>
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                        </Form>
                    )}
                </Formik>

                <Link to={'/register'}>Don't have an account? <strong className="text-hippie-green-800">Register</strong></Link>
            </div>
        </div>
    );
};

export default Login;
