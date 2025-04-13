'use client'

import React, { useEffect, useState } from 'react'
import { getProviders, signIn, ClientSafeProvider } from "next-auth/react"
import { FiUser, FiLock, FiMail, FiGithub, FiTwitter } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const fetchedProviders = await getProviders() as Record<string, ClientSafeProvider>
        setProviders(fetchedProviders)
      } catch (err) {
        console.error("Error fetching auth providers:", err)
        setError("Could not load authentication providers")
      }
    }
    
    fetchProviders()
  }, [])

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required')
      }
      
      console.log('Attempting to sign in with credentials:', { email: formData.email })
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })
      
      console.log('Sign in result:', result)
      
      if (!result) {
        throw new Error('Authentication failed - no result returned')
      }
      
      if (result.error) {
        throw new Error(`Authentication error: ${result.error}`)
      }
      
      // Redirect to dashboard on successful login
      console.log('Authentication successful, redirecting to dashboard')
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (providerId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await signIn(providerId, { callbackUrl: "/dashboard" })
    } catch (err) {
      console.error(`Error signing in with ${providerId}:`, err)
      setError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get provider icon
  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
            </g>
          </svg>
        )
      case 'github':
        return <FiGithub className="h-5 w-5" />
      case 'twitter':
        return <FiTwitter className="h-5 w-5" />
      default:
        return <FiMail className="h-5 w-5" />
    }
  }

  // Helper function to get provider button styles
  const getProviderButtonStyles = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
      case 'github':
        return "bg-gray-800 hover:bg-gray-900 text-white"
      case 'twitter':
        return "bg-blue-400 hover:bg-blue-500 text-white"
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white"
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <FiUser className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Expenso
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your finances and track your expenses
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Email/Password Sign In Form */}
        <form className="mt-8 space-y-6" onSubmit={handleCredentialsLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Email'}
            </button>
          </div>
        </form>
        
        {/* OAuth Providers */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {providers &&
              Object.values(providers).filter(provider => provider.id !== 'credentials').map((provider) => (
                <div key={provider.name} className="text-center">
                  <button
                    onClick={() => handleOAuthSignIn(provider.id)}
                    disabled={isLoading}
                    className={`group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${getProviderButtonStyles(provider.id)}`}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      {getProviderIcon(provider.id)}
                    </span>
                    {isLoading ? 'Signing in...' : `Sign in with ${provider.name}`}
                  </button>
                </div>
              ))}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                By signing in, you agree to our
                <Link href="#" className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Terms of Service
                </Link>
                <span className="mx-1">and</span>
                <Link href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Expenso. All rights reserved.
      </div>
    </div>
  )
} 