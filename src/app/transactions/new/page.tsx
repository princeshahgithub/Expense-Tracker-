'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Category } from '@/types'

// Fallback categories if API fails
const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Food', type: 'EXPENSE', color: '#F87171' },
  { id: '2', name: 'Transportation', type: 'EXPENSE', color: '#60A5FA' },
  { id: '3', name: 'Entertainment', type: 'EXPENSE', color: '#818CF8' },
  { id: '4', name: 'Shopping', type: 'EXPENSE', color: '#F472B6' },
  { id: '5', name: 'Utilities', type: 'EXPENSE', color: '#A78BFA' },
  { id: '6', name: 'Salary', type: 'INCOME', color: '#34D399' },
  { id: '7', name: 'Freelance', type: 'INCOME', color: '#A3E635' },
  { id: '8', name: 'Investment', type: 'INCOME', color: '#FBBF24' },
]

export default function NewTransactionPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES as Category[])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    frequency: 'MONTHLY',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        
        if (!response.ok) {
          console.error('Failed to fetch categories, status:', response.status)
          // Use fallback categories
          return
        }
        
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback categories are already set
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchCategories()
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-gray-900 dark:text-white">Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-lg mb-4 font-medium text-gray-900 dark:text-white">Please sign in to add transactions</p>
        <Link href="/auth/signin" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate amount is a valid number
      if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount greater than zero')
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
        credentials: 'include'  // Change to 'include' for better session handling
      })

      if (!response.ok) {
        // Attempt to parse error as JSON, fall back to text if it fails
        let errorMessage = `Failed to create transaction: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          
          // Check if the response has an error message
          if (errorData.error) {
            errorMessage = errorData.error;
            
            // If there are validation details, add them to the error
            if (errorData.details) {
              const detailMessages = Array.isArray(errorData.details) 
                ? errorData.details.map((d: any) => d.message).join(', ')
                : JSON.stringify(errorData.details);
              
              errorMessage = `${errorMessage}: ${detailMessages}`;
            }
          }
        } catch (parseError) {
          // If it's not JSON, get the text instead
          const textError = await response.text();
          console.error('API error text:', textError);
          if (textError) {
            errorMessage = textError;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Successfully created transaction - don't use redirects that might lose session
      // Just use simple router.push
      router.push('/transactions');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Transaction creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Transaction</h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-700 dark:text-gray-300">Loading categories...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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
                value={formData.type}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value,
                    categoryId: '' // Reset category when type changes
                  }))
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
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
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
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-field"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                This is a recurring transaction
              </label>
            </div>

            {formData.isRecurring && (
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
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
                className="btn-primary flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Transaction'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/transactions')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 