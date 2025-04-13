'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi'
import type { Transaction, Category } from '@/types'
import { useSettings } from '@/contexts/SettingsContext'

export default function TransactionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { formatCurrency, formatDate } = useSettings()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    date: '',
    notes: '',
    isRecurring: false,
    frequency: 'MONTHLY',
  })

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchTransaction()
      fetchCategories()

      // Check if edit mode is activated from the URL
      const editMode = searchParams.get('edit') === 'true'
      setIsEditing(editMode)
    }
  }, [status, params.id, searchParams])

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      console.log(`Fetching transaction with ID: ${params.id}`)
      const response = await fetch(`/api/transactions/${params.id}`)
      
      console.log(`API response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error(`API error response:`, errorData)
        
        if (response.status === 404) {
          setError(`Transaction not found. ID: ${params.id}`)
          return
        }
        
        throw new Error(errorData.error || `Failed to fetch transaction: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Transaction data received:', data)
      
      if (!data || !data.id) {
        throw new Error('Invalid transaction data received')
      }
      
      setTransaction(data)
      
      // Initialize form data
      setFormData({
        title: data.title,
        amount: data.amount.toString(),
        type: data.type,
        categoryId: data.categoryId,
        date: format(new Date(data.date), 'yyyy-MM-dd'),
        notes: data.notes || '',
        isRecurring: data.isRecurring || false,
        frequency: data.frequency || 'MONTHLY',
      })
    } catch (error) {
      console.error('Error fetching transaction:', error)
      setError(error instanceof Error ? error.message : 'Failed to load transaction details')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to load categories')
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      // Don't set main error state, just log to console
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/transactions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (!response.ok) {
        let errorMessage = `Failed to update transaction: ${response.status}`
        
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
            if (errorData.details) {
              const detailMessages = Array.isArray(errorData.details) 
                ? errorData.details.map((d: any) => d.message).join(', ')
                : JSON.stringify(errorData.details)
              
              errorMessage = `${errorMessage}: ${detailMessages}`
            }
          }
        } catch (e) {
          // If response isn't JSON, use the status text
          errorMessage = await response.text() || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      // After successful save, redirect to transactions page
      router.push('/transactions')
      
    } catch (error) {
      console.error('Error updating transaction:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/transactions/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete transaction')
      }

      // Redirect back to transactions list after successful deletion
      router.push('/transactions')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while deleting')
      setIsDeleting(false)
    }
  }

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
        <p className="text-lg mb-4 font-medium text-gray-900 dark:text-white">Please sign in to view transaction details</p>
        <Link href="/auth/signin" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  if (error && !transaction) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
            <p className="font-medium">Error Details:</p>
            <p>{error}</p>
          </div>
          <div className="flex justify-center mt-6">
            <Link href="/transactions" className="btn-secondary">
              Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!transaction) {
    // If the transaction is not found after loading, redirect to transactions list
    useEffect(() => {
      if (!loading && !transaction && error) {
        const timer = setTimeout(() => {
          router.push('/transactions');
        }, 3000); // Redirect after 3 seconds
        
        return () => clearTimeout(timer);
      }
    }, [loading, transaction, error, router]);
    
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-4">Transaction not found. Redirecting to transactions list...</p>
          <Link href="/transactions" className="btn-secondary">
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Transaction' : 'Transaction Details'}
          </h1>
          
          {!isEditing && (
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiTrash2 className="w-4 h-4 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
            <p className="font-medium">Error Details:</p>
            <p>{error}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={(e) => {
                  handleInputChange(e)
                  // Reset category when type changes
                  if (e.target.value !== formData.type) {
                    setFormData(prev => ({ ...prev, categoryId: '' }))
                  }
                }}
                className="input-field"
                aria-label="Transaction type"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="input-field"
                required
                aria-label="Transaction category"
              >
                <option value="">Select a category</option>
                {categories
                  .filter(cat => cat.type === formData.type)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                Recurring Transaction
              </label>
            </div>

            {formData.isRecurring && (
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="input-field"
                  aria-label="Transaction frequency"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary flex-1 inline-flex items-center justify-center"
                disabled={isSubmitting}
              >
                <FiSave className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex-1 inline-flex items-center justify-center"
                disabled={isSubmitting}
              >
                <FiX className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{transaction.title}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</span>
                <span className={`text-sm font-semibold ${
                  transaction.type === 'INCOME' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                <div className="flex items-center">
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: transaction.category?.color || '#CBD5E0' }}
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {transaction.category?.name}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(transaction.date)}
                </span>
              </div>
              
              {transaction.notes && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</span>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{transaction.notes}</p>
                </div>
              )}
              
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Recurring</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {transaction.isRecurring ? 'Yes' : 'No'}
                </span>
              </div>
              
              {transaction.isRecurring && transaction.frequency && (
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Frequency</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {transaction.frequency.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Link href="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                ← Back to Transactions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 