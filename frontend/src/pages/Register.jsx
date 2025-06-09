import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from 'react-icons/fa'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, sendEmailVerification } from 'firebase/auth'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'

const Register = () => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  })

  const registerUserInBackend = async (userData) => {
    console.log("userData", userData);
    try {
      if (!userData.uid) {
        throw new Error('User ID is missing');
      }
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/user/register`, userData)
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('User already exists')
      }
      throw new Error('Error registering user in backend')
    }
  }

  const handleRegister = async (values) => {
    setError('')
    setLoading(true)

    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: values.name
      })

      // Send verification email
      await sendEmailVerification(userCredential.user)

      // Register in backend
      await registerUserInBackend({
        name: values.name,
        email: values.email,
        uid: userCredential.user.uid
      })

      // Show verification modal
      setVerificationEmail(values.email)
      setShowVerificationModal(true)

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please use a different email or sign in.')
      } else if (error.message === 'User already exists') {
        setError('User already exists in our system.')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const checkEmailVerification = async () => {
    setIsVerifying(true)
    try {
      await auth.currentUser?.reload()
      if (auth.currentUser?.emailVerified) {
        // User is verified, sign them in
        const user = auth.currentUser
        const idToken = await user.getIdToken()
        setShowVerificationModal(false)
        navigate('/home')
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.')
      }
    } catch (error) {
      setError('Error checking verification status. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { displayName, email, uid } = result.user

      // Register in backend
      await registerUserInBackend({
        name: displayName,
        email: email,
        uid: uid
      })

      navigate('/home')
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled. Please try again.')
      } else if (error.message === 'User already exists') {
        setError('User already exists in our system.')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row">
      {/* Left side with logo - fixed */}
      <div className="lg:h-screen w-full lg:w-1/2 text-center lg:sticky lg:top-0">
        <img src="/login.svg" alt="Logo" className="w-full h-full mx-auto mb-4" />
      </div>

      {/* Right side with register form - scrollable */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-10 overflow-y-auto">
        <div className="w-full flex flex-col items-center gap-10">
          <img src="/logoName.png" alt="Regio" className="h-20" />
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Create Account</h2>

          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form className="w-10/12 md:w-8/12 space-y-6">
                <div className="relative">
                  <label htmlFor="name" className="block text-md font-medium text-gray-700 pb-1">
                    Full Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    className="peer block w-full px-2 py-2 border-b border-gray-300 bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
                    placeholder="John Doe"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-hippie-green-500 transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full"></span>
                </div>

                <div className="relative">
                  <label htmlFor="email" className="block text-md font-medium text-gray-700 pb-1">
                    Email address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className="peer block w-full px-2 py-2 border-b border-gray-300 bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
                    placeholder="example@email.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-hippie-green-500 transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full"></span>
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-md font-medium text-gray-700 pb-1">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    className="peer block w-full px-2 py-2 border-b border-gray-300 bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
                    placeholder="********"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-hippie-green-500 transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full"></span>
                </div>

                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-md font-medium text-gray-700 pb-1">
                    Confirm Password
                  </label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="peer block w-full px-2 py-2 border-b border-gray-300 bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
                    placeholder="********"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                  <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-hippie-green-500 transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full"></span>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-hippie-green-600 hover:bg-hippie-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500 text-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/281/281764.png" alt="Google" className="w-6 h-6" />
                  Continue with Google
                </button>
              </Form>
            )}
          </Formik>

          <Link to="/login" className="w-full text-center font-medium text-hippie-green-950">
            Already have an account? <span className='text-hippie-green-600 font-bold'>Sign in</span>
          </Link>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full verification-modal">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-hippie-green-100 mb-4">
                <svg className="h-6 w-6 text-hippie-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verify your email</h3>
              <p className="text-sm text-gray-500 mb-4">
                We've sent a verification link to <span className="font-medium text-gray-900">{verificationEmail}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please check your inbox and click the verification link to continue.
              </p>
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4">{error}</div>
              )}
              <div className="space-y-3">
                <button
                  onClick={checkEmailVerification}
                  disabled={isVerifying}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hippie-green-600 hover:bg-hippie-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Checking...' : 'I have verified my email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register