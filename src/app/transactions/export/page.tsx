'use client'

import React, { useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { FiDownload, FiCalendar, FiFilter, FiLoader } from 'react-icons/fi'
import PageHeader from '@/components/PageHeader'
import { useRouter } from 'next/navigation'

// We'll use the same transaction data that's used in the main transactions page
// This would typically come from a shared context, Redux store, or API endpoint
interface Transaction {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

interface FilterOptions {
  startDate: string
  endDate: string
  category: string
}

export default function ExportTransactionsPage() {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    category: ''
  })
  
  // Fetch transactions from the same source as the main transactions page
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        
        // In a real app, you would fetch data from your API or state management store
        // For now, we'll use localStorage as a simple way to share data between pages
        const storedTransactions = localStorage.getItem('currentTransactions')
        
        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions))
        } else {
          // Fallback to API call if data isn't in localStorage
          // This is where you'd make an API call to fetch the transactions
          const response = await fetch('/api/transactions')
          if (response.ok) {
            const data = await response.json()
            setTransactions(data)
          } else {
            throw new Error('Failed to fetch transactions')
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        // If we can't get the actual transactions, redirect to the main transactions page
        router.push('/transactions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [router])
  
  // Extract unique categories from transactions
  const categories = Array.from(new Set(transactions.map(tx => tx.category)))
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }
  
  // Apply filters to transactions
  const filteredTransactions = transactions.filter(tx => {
    // Filter by date range if dates are specified
    if (filters.startDate && new Date(tx.date) < new Date(filters.startDate)) {
      return false
    }
    if (filters.endDate && new Date(tx.date) > new Date(filters.endDate)) {
      return false
    }
    // Filter by category if selected
    if (filters.category && tx.category !== filters.category) {
      return false
    }
    return true
  })
  
  const exportToExcel = async () => {
    try {
      setIsExporting(true)
      
      // Format transactions for export
      const dataToExport = filteredTransactions.map(tx => ({
        ID: tx.id,
        Date: tx.date,
        Title: tx.title,
        Category: tx.category,
        Description: tx.description,
        Amount: tx.amount,
        Type: tx.type === 'INCOME' ? 'Income' : 'Expense'
      }))
      
      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
      
      // Generate filename with date
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const fileName = `transactions_export_${dateStr}.xlsx`
      
      // Convert to binary and save
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, fileName)
      
      // Show success message or notification here
      
    } catch (error) {
      console.error('Export failed:', error)
      // Show error message to user
    } finally {
      setIsExporting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <PageHeader 
          title="Export Transactions" 
          description="Loading your transaction data..."
        />
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <PageHeader 
        title="Export Transactions" 
        description="Export your transaction data to Excel for further analysis or record-keeping."
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Transactions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Start Date"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="End Date"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by Category"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="mr-4 p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FiDownload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Ready to Export: {filteredTransactions.length} Transactions
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Exporting as Excel (.xlsx) file. Your file will be ready to download immediately.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {!filters.startDate && !filters.endDate && !filters.category 
              ? 'No filters applied. All transactions will be exported.' 
              : 'Filtered by your selected criteria.'
            }
          </p>
          
          <button
            onClick={exportToExcel}
            disabled={isExporting || filteredTransactions.length === 0}
            className={`flex items-center px-4 py-2 rounded-md text-white font-medium
              ${isExporting || filteredTransactions.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isExporting ? (
              <>
                <FiLoader className="animate-spin h-4 w-4 mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <FiDownload className="h-4 w-4 mr-2" />
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Preview of data that will be exported */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Preview
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {tx.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tx.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tx.description}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      tx.type === 'INCOME'
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ₹{Math.abs(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tx.type === 'INCOME' ? 'Income' : 'Expense'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No transactions match your filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {filteredTransactions.length > 5 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
              Showing 5 of {filteredTransactions.length} transactions in preview. All {filteredTransactions.length} will be exported.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 