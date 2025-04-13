import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

// Storage keys
const TRANSACTIONS_STORAGE_KEY = 'expense-tracker-transactions'
const BUDGETS_STORAGE_KEY = 'expense-tracker-budgets'
const CATEGORIES_STORAGE_KEY = 'expense-tracker-categories'

// Helper functions for persisted storage
const getStorageData = () => {
  try {
    // Try to get user identifier from cookies for storage isolation
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')?.value || 'anonymous'
    const storageId = sessionToken.substring(0, 8) // Use part of the session for isolation

    // Create path to the data directory
    const storageDir = path.join(process.cwd(), '.next', 'server', 'storage')
    
    // Ensure directory exists
    if (!fs.existsSync(storageDir)) {
      try {
        fs.mkdirSync(storageDir, { recursive: true })
      } catch (err) {
        console.error('Failed to create or access storage directory:', err)
        return {}
      }
    }

    const storagePath = path.join(storageDir, `${storageId}.json`)
    
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf8')
      return JSON.parse(data)
    }
    
    return {}
  } catch (error) {
    console.error('Error accessing storage:', error)
    return {}
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    if (!userId) {
      console.error('User ID not found in session')
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    // Get current date for filtering
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Format dates for API calls
    const startDateString = startDate.toISOString().split('T')[0]
    const endDateString = endDate.toISOString().split('T')[0]
    
    // Fetch fresh data from storage
    const storageData = getStorageData()
    
    // Read transaction data
    const transactionsData = storageData[TRANSACTIONS_STORAGE_KEY] || '[]'
    const transactions = JSON.parse(transactionsData)
    
    // Filter to user's transactions for the current month
    const userTransactions = transactions.filter((tx: any) => {
      if (tx.userId !== userId) return false
      const txDate = new Date(tx.date)
      return txDate >= startDate && txDate <= endDate
    })
    
    // Read budget data
    const budgetsData = storageData[BUDGETS_STORAGE_KEY] || '[]'
    const budgets = JSON.parse(budgetsData)
    
    // Filter to user's budgets
    const userBudgets = budgets.filter((budget: any) => budget.userId === userId)
    
    // Calculate budget usage
    const budgetsWithUsage = userBudgets.map((budget: any) => {
      // Find transactions for this budget's category
      const categoryTransactions = userTransactions.filter((tx: any) => 
        tx.categoryId === budget.categoryId && tx.type === 'EXPENSE'
      )
      
      // Sum up the transaction amounts
      const spent = categoryTransactions.reduce((sum: number, tx: any) => 
        sum + (Number(tx.amount) || 0), 0
      )
      
      // Calculate percentage
      const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentageUsed: Math.min(percentageUsed, 100)
      }
    })
    
    // Read category data
    const categoriesData = storageData[CATEGORIES_STORAGE_KEY] || '[]'
    const categories = JSON.parse(categoriesData)
    
    // Filter to user's categories
    const userCategories = categories.filter((cat: any) => cat.userId === userId)
    
    // Calculate total spent by category
    const categoryTotals = userCategories.map((category: any) => {
      const categoryTransactions = userTransactions.filter((tx: any) => 
        tx.categoryId === category.id && tx.type === 'EXPENSE'
      )
      
      const spent = categoryTransactions.reduce((sum: number, tx: any) => 
        sum + (Number(tx.amount) || 0), 0
      )
      
      return {
        category,
        spent,
        count: categoryTransactions.length
      }
    })
    
    // Calculate total income and expenses for the month
    const totalIncome = userTransactions
      .filter((tx: any) => tx.type === 'INCOME')
      .reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0)
    
    const totalExpenses = userTransactions
      .filter((tx: any) => tx.type === 'EXPENSE')
      .reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        transactions: {
          count: userTransactions.length,
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses
        },
        budgets: {
          count: userBudgets.length,
          items: budgetsWithUsage
        },
        categories: {
          count: userCategories.length,
          totals: categoryTotals
        }
      }
    })
  } catch (error) {
    console.error('Error refreshing dashboard data:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 