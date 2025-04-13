'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiArrowUp, FiArrowDown, FiTrendingUp } from 'react-icons/fi'
import { RiCoinLine } from 'react-icons/ri'
import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { formatCurrency, formatDate } = useSettings()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    if (status === 'authenticated') {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard', {
          credentials: 'same-origin',
          // Add cache-busting parameter to prevent browser caching
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
  }

  // Refresh dashboard data when component mounts or session changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, lastRefresh])

  const handleRefresh = () => {
    setLastRefresh(Date.now())
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your financial dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
          {error}
        </div>
        <div className="text-center mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Default empty state when no data is available
  const summaryData = dashboardData?.summaryData || {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0
  }

  const recentTransactions = dashboardData?.recentTransactions || []

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {session?.user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your finances</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Refresh dashboard data"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
              <p className={`text-2xl font-semibold ${summaryData.totalBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(summaryData.totalBalance)}
              </p>
              {summaryData.totalBalance < 0 && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">Negative balance</p>
              )}
            </div>
            <div className={`p-3 rounded-full ${summaryData.totalBalance >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <RiCoinLine className={`h-7 w-7 ${summaryData.totalBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(summaryData.monthlyIncome)}</p>
              {summaryData.monthlyIncome > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
              )}
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FiArrowUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expenses</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(summaryData.monthlyExpenses)}</p>
              {summaryData.monthlyExpenses > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
              )}
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <FiArrowDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Savings Rate</p>
              <p className={`text-2xl font-semibold ${
                summaryData.savingsRate > 0
                  ? 'text-green-600 dark:text-green-400'
                  : summaryData.savingsRate < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
              }`}>
                {Math.abs(summaryData.savingsRate).toFixed(1)}%
              </p>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {summaryData.savingsRate > 0 
                  ? 'Saving money' 
                  : summaryData.savingsRate < 0 
                    ? 'Spending more than income' 
                    : 'Breaking even'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              summaryData.savingsRate > 0
                ? 'bg-green-100 dark:bg-green-900'
                : summaryData.savingsRate < 0
                  ? 'bg-red-100 dark:bg-red-900'
                  : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <FiTrendingUp className={`h-6 w-6 ${
                summaryData.savingsRate > 0
                  ? 'text-green-600 dark:text-green-400'
                  : summaryData.savingsRate < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions found</p>
            <Link 
              href="/transactions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Your First Transaction
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentTransactions.map((transaction: any) => (
              <Link 
                href={`/transactions/${transaction.id}`}
                key={transaction.id} 
                className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${
                    transaction.amount > 0 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {transaction.amount > 0 ? (
                      <FiArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.title}</p>
                    <div className="flex items-center">
                      {transaction.categoryColor && (
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: transaction.categoryColor }}
                        />
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    transaction.amount > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 