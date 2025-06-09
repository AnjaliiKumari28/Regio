import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, sendEmailVerification, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('userCredentials')
    if (savedCredentials) {
      const { email, password, rememberMe } = JSON.parse(savedCredentials)
      // Set initial values for Formik
      if (rememberMe) {
        formikRef.current?.setValues({
          email,
          password,
          rememberMe: true
        })
      }
    }
  }, [])

  const formikRef = React.useRef()

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  })

  const handleLogin = async (values) => {
    setError('')
    setLoading(true)

    try {
      // Set persistence based on remember me checkbox
      await setPersistence(auth, values.rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
      
      // Save credentials if remember me is checked
      if (values.rememberMe) {
        localStorage.setItem('userCredentials', JSON.stringify({
          email: values.email,
          password: values.password,
          rememberMe: true
        }))
      } else {
        // Remove saved credentials if remember me is unchecked
        localStorage.removeItem('userCredentials')
      }
      
      if (!userCredential.user.emailVerified) {
        setVerificationEmail(values.email)
        setShowVerificationModal(true)
        // Don't sign out, just show the verification modal
        return
      }
      
      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkEmailVerification = async () => {
    setIsVerifying(true)
    try {
      // Reload the user to get the latest verification status
      await auth.currentUser?.reload()
      const user = auth.currentUser
      
      if (!user) {
        setError('No user found. Please try logging in again.')
        return
      }

      if (user.emailVerified) {
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

  const resendVerificationEmail = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        setError('No user found. Please try logging in again.')
        return
      }

      await sendEmailVerification(user)
      setError('')
      // Show success message in modal
      const modalElement = document.querySelector('.verification-modal')
      if (modalElement) {
        const successMessage = document.createElement('div')
        successMessage.className = 'text-green-600 text-sm mb-4 bg-green-50 p-2 rounded'
        successMessage.textContent = '✓ Verification link sent! Please check your inbox.'
        modalElement.insertBefore(successMessage, modalElement.firstChild)
        // Remove the message after 5 seconds
        setTimeout(() => {
          successMessage.remove()
        }, 5000)
      }
    } catch (error) {
      setError('Error resending verification email. Please try again.')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      // For Google sign-in, we'll use local persistence by default
      await setPersistence(auth, browserLocalPersistence)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      navigate('/home')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      alert('Password reset email sent! Please check your inbox.')
      setShowForgotPassword(false)
      setResetEmail('')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row">
      {/* Left side with logo - fixed */}
      <div className="lg:h-screen w-full lg:w-1/2 text-center lg:sticky lg:top-0">
        <img src="/login.svg" alt="Logo" className="w-full h-full mx-auto mb-4" />
      </div>

      {/* Right side with login form - scrollable */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-10 overflow-y-auto">
        <div className="w-full flex flex-col items-center gap-10">
          <img src="/logoName.png" alt="Regio" className="h-20" />
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Welcome Back</h2>

          <Formik
            innerRef={formikRef}
            initialValues={{
              email: '',
              password: '',
              rememberMe: false
            }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ values, setFieldValue }) => (
              <Form className="w-10/12 md:w-8/12 space-y-6">
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
                  <div className="relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="peer block w-full px-2 py-2 border-b border-gray-300 bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-hippie-green-500 transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full"></span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={values.rememberMe}
                      onChange={(e) => {
                        setFieldValue('rememberMe', e.target.checked)
                        // If unchecking remember me, remove saved credentials
                        if (!e.target.checked) {
                          localStorage.removeItem('userCredentials')
                        }
                      }}
                      className="h-4 w-4 text-hippie-green-600 focus:ring-hippie-green-500 border-gray-300 rounded accent-hippie-green-500 cursor-pointer"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 block text-sm text-gray-900 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-md font-semibold text-hippie-green-600 hover:text-hippie-green-500"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-hippie-green-600 hover:bg-hippie-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
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
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500 text-md"
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/281/281764.png" alt="Google" className="w-6 h-6" />
                  Continue with Google
                </button>
              </Form>
            )}
          </Formik>

          <Link to="/register" className="w-full text-center font-medium text-hippie-green-950">
            Don't have an account? <span className='text-hippie-green-600 font-bold'>Sign up</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Forgot Password?</h3>
              <img src="/forgot.svg" alt="Forgot Password" className="w-full mx-auto mb-4" />
              <p className="mt-2 text-gray-600">Enter your email to reset your password</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <label htmlFor="reset-email" className="block text-md font-medium text-gray-700 pb-1">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="peer block w-full px-2 py-2 border-b border-gray-300 bg-transparent text-gray-900 focus:outline-none placeholder:text-gray-400"
                  placeholder="example@email.com"
                />
                <span className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0 bg-hippie-green-500 transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full"></span>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hippie-green-600 hover:bg-hippie-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}

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
                <button
                  onClick={resendVerificationEmail}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hippie-green-500"
                >
                  Resend verification email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login