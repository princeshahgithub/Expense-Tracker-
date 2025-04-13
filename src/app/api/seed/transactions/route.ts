import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

// Storage keys
const TRANSACTIONS_STORAGE_KEY = 'expense-tracker-transactions'
const CATEGORIES_STORAGE_KEY = 'expense-tracker-categories'

// In-memory storage as a fallback
let memoryStorage: Record<string, string> = {}

// Helper functions for persisted storage
const getStorageData = () => {
  try {
    // Try to get user identifier from cookies for storage isolation
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')?.value || 'anonymous'
    const storageId = sessionToken.substring(0, 8) // Use part of the session for isolation

    // Create path to the data directory - use /tmp for temporary storage
    const storageDir = path.join(process.cwd(), '.next', 'server', 'storage')
    
    // Ensure directory exists
    if (!fs.existsSync(storageDir)) {
      try {
        fs.mkdirSync(storageDir, { recursive: true })
      } catch (err) {
        console.error('Failed to create storage directory, using memory storage:', err)
        return memoryStorage
      }
    }

    const storagePath = path.join(storageDir, `${storageId}.json`)
    
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf8')
      return JSON.parse(data)
    }
    
    // Initialize with empty storage
    fs.writeFileSync(storagePath, JSON.stringify({}))
    return {}
  } catch (error) {
    console.error('Error accessing storage, using memory fallback:', error)
    return memoryStorage
  }
}

const saveStorageData = (data: Record<string, string>) => {
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
        console.error('Failed to create storage directory, using memory storage:', err)
        memoryStorage = data
        return
      }
    }
    
    const storagePath = path.join(storageDir, `${storageId}.json`)
    fs.writeFileSync(storagePath, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving storage, using memory fallback:', error)
    memoryStorage = data
  }
}

// Custom storage implementation for server-side
const serverStorage = {
  getItem: (key: string): string | null => {
    const data = getStorageData()
    return data[key] || null
  },
  setItem: (key: string, value: string): void => {
    const data = getStorageData()
    data[key] = value
    saveStorageData(data)
  },
  removeItem: (key: string): void => {
    const data = getStorageData()
    delete data[key]
    saveStorageData(data)
  }
}

// Helper function to get all categories
const getCategories = (userId: string) => {
  try {
    const storedCategories = serverStorage.getItem(CATEGORIES_STORAGE_KEY) || '[]'
    const allCategories = JSON.parse(storedCategories)
    return allCategories.filter((category: any) => category.userId === userId)
  } catch (error) {
    console.error('Error retrieving categories:', error)
    return []
  }
}

// Helper functions for transactions
const getTransactions = (userId: string) => {
  try {
    const storedTransactions = serverStorage.getItem(TRANSACTIONS_STORAGE_KEY) || '[]'
    const allTransactions = JSON.parse(storedTransactions)
    return allTransactions.filter((transaction: any) => transaction.userId === userId)
  } catch (error) {
    console.error('Error retrieving transactions:', error)
    return []
  }
}

const saveTransactions = (transactions: any[]) => {
  try {
    const existingData = serverStorage.getItem(TRANSACTIONS_STORAGE_KEY) || '[]'
    const existingTransactions = JSON.parse(existingData)
    
    // Filter out transactions being updated/added
    const otherTransactions = existingTransactions.filter(
      (transaction: any) => !transactions.some(t => t.id === transaction.id)
    )
    
    // Save combined transactions
    const allTransactions = [...otherTransactions, ...transactions]
    serverStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(allTransactions))
    
    return true
  } catch (error) {
    console.error('Error saving transactions:', error)
    return false
  }
}

// Generate a random date within the provided range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
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
    
    // Get user's categories
    const categories = getCategories(userId)
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'No categories found. Please create categories first.' }, { status: 400 })
    }
    
    // Filter expense categories
    const expenseCategories = categories.filter(category => category.type === 'EXPENSE')
    
    if (expenseCategories.length === 0) {
      return NextResponse.json({ error: 'No expense categories found. Please create expense categories first.' }, { status: 400 })
    }
    
    // Generate sample transactions for the current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Generate between 10-20 random transactions
    const numTransactions = Math.floor(Math.random() * 11) + 10
    const newTransactions = []
    
    for (let i = 0; i < numTransactions; i++) {
      // Pick a random category
      const randomCategoryIndex = Math.floor(Math.random() * expenseCategories.length)
      const category = expenseCategories[randomCategoryIndex]
      
      // Generate a random amount between $1 and $200
      const amount = Math.round((Math.random() * 199 + 1) * 100) / 100
      
      // Create the transaction
      const transaction = {
        id: uuidv4(),
        userId: userId,
        title: `${category.name} expense ${i + 1}`,
        amount: amount,
        type: 'EXPENSE',
        date: randomDate(startOfMonth, endOfMonth).toISOString(),
        categoryId: category.id,
        notes: `Sample expense generated for ${category.name}`,
        currency: 'USD',
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      newTransactions.push(transaction)
    }
    
    // Save the transactions
    if (saveTransactions(newTransactions)) {
      return NextResponse.json({ 
        success: true, 
        message: `${newTransactions.length} sample transactions generated for the current month.`,
        transactions: newTransactions
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to save sample transactions' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error generating sample transactions:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 