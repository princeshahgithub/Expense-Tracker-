'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface Category {
  id: string
  name: string
  color: string
  type: 'INCOME' | 'EXPENSE'
  icon?: string
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#F87171',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    icon: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCategories()
    }
  }, [status])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!newCategory.name.trim()) {
        throw new Error('Name is required')
      }

      if (!newCategory.color.match(/^#[0-9A-Fa-f]{6}$/)) {
        throw new Error('Please provide a valid hex color')
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Failed to create category')
      }

      // Reset form and refresh categories
      setNewCategory({
        name: '',
        color: '#F87171',
        type: 'EXPENSE',
        icon: '',
      })
      
      await fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      setFormError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete category')
        return
      }

      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
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
        <p className="text-lg mb-4 font-medium text-gray-900 dark:text-white">Please sign in to view categories</p>
        <Link href="/auth/signin" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h2>
            
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-4">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="color" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-10 rounded border border-gray-300 dark:border-gray-600"
                    title="Choose a color"
                    aria-label="Choose a color"
                  />
                  <input
                    type="text"
                    id="colorHex"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="input-field"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                    title="Hex color code"
                    aria-label="Hex color code"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Type
                </label>
                <select
                  id="type"
                  value={newCategory.type}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as 'INCOME' | 'EXPENSE' }))}
                  className="input-field"
                  aria-label="Category type"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="icon" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  id="icon"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. FiHome, FiDollarSign"
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">
              Your Categories
            </h2>
            
            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No categories found. Create your first category!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map(category => (
                  <div key={category.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category.type === 'INCOME' ? 'Income' : 'Expense'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete category"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 