'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useSettings } from '@/contexts/SettingsContext'

interface Category {
  id: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  notes?: string;
  category: Category;
}

interface Filter {
  type: string;
  category: string;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const { formatCurrency, formatDate } = useSettings()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>({
    type: 'ALL',
    category: 'ALL'
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions()
    }
  }, [status, lastRefresh])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete transaction')
      }

      // Trigger a refresh rather than calling fetchTransactions directly
      setLastRefresh(Date.now())
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert(error instanceof Error ? error.message : 'An error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRefresh = () => {
    setLastRefresh(Date.now())
  }

  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    if (filter.type !== 'ALL' && transaction.type !== filter.type) return false
    if (filter.category !== 'ALL' && transaction.category.name !== filter.category) return false
    return true
  })

  // Store filtered transactions in localStorage for export feature
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      // Convert the filteredTransactions to a simple format that can be easily JSON serialized
      const exportableTransactions = filteredTransactions.map(tx => ({
        id: tx.id,
        date: tx.date,
        title: tx.title,
        description: tx.notes || '',
        category: tx.category.name,
        amount: tx.amount,
        type: tx.type
      }));
      
      // Store in localStorage for the export feature to access
      localStorage.setItem('currentTransactions', JSON.stringify(exportableTransactions));
    }
  }, [filteredTransactions]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-gray-900 dark:text-white">Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-lg mb-4 font-medium text-gray-900 dark:text-white">Please sign in to view transactions</p>
        <Link href="/auth/signin" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex-1 sm:flex-none justify-center"
            aria-label="Refresh transactions"
          >
            Refresh
          </button>
          <Link href="/transactions/new" className="btn-primary flex-1 sm:flex-none justify-center">
            <FiPlus className="w-5 h-5 mr-2" />
            Add Transaction
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="input-field"
              aria-label="Filter transactions by type"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            <select
              value={filter.category}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
              aria-label="Filter transactions by category"
            >
              <option value="ALL">All Categories</option>
              {Array.from(new Set(transactions.map(t => t.category.name))).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions found</p>
            <Link 
              href="/transactions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Your First Transaction
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.title}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-opacity-50" 
                        style={{
                          backgroundColor: `${transaction.category.color}20`,
                          color: transaction.category.color
                        }}>
                        {transaction.category.name}
                      </span>
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${transaction.type === 'EXPENSE' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {transaction.type === 'EXPENSE' ? '- ' : '+ '}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <div className="flex items-center justify-end space-x-3">
                        <Link 
                          href={`/transactions/${transaction.id}?edit=true`} 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          title="Edit transaction"
                          aria-label="Edit transaction"
                        >
                          <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                          title="Delete transaction"
                          aria-label="Delete transaction"
                          disabled={isDeleting}
                        >
                          <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 