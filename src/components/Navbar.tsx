'use client'

import React, { useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FiBell, FiLogOut, FiMenu } from 'react-icons/fi'
import { useTranslation } from '@/contexts/TranslationContext'
import Image from 'next/image'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0 flex items-center">
            {/* Mobile menu button - only shown on small screens */}
            <button 
              className="inline-flex items-center justify-center p-2 mr-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open main menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            
            <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <Image 
                src="/android-chrome-192x192.png" 
                alt="Expenso Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {t('common.expenseTracker')}
              </span>
            </Link>
          </div>

          {/* Right side - User Controls */}
          <div className="flex items-center">
            {status === 'unauthenticated' && (
              <div className="hidden md:flex space-x-3">
                <Link 
                  href="/auth/signin" 
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {t('common.signIn')}
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
                >
                  {t('common.signUp')}
                </Link>
              </div>
            )}

            {status === 'authenticated' && (
              <div className="flex items-center space-x-6">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen)
                      setIsMenuOpen(false)
                    }}
                    className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700 transition-colors"
                    aria-label={t('common.notifications')}
                  >
                    <FiBell className="h-5 w-5" />
                  </button>
                  
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                        {t('common.notifications')}
                      </div>
                      <div className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        {t('common.noNotifications')}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User Profile */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen)
                      setIsNotificationsOpen(false)
                    }}
                    className="flex items-center space-x-2 focus:outline-none"
                    aria-label="User menu"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white font-medium shadow-sm">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                      {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-52 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 sm:hidden">
                        {session.user?.name || session.user?.email}
                      </div>
                      <button 
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <div className="flex items-center">
                          <FiLogOut className="mr-2 h-4 w-4" />
                          {t('common.signOut')}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {status === 'authenticated' ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/transactions" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 