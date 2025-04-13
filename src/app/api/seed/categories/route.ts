import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

// Storage key for localStorage
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

    // Create path to the data directory
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

// Type definition for categories
interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// Default categories
const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#F87171', type: 'EXPENSE', icon: 'FiShoppingCart' },
  { name: 'Transportation', color: '#60A5FA', type: 'EXPENSE', icon: 'FiTruck' },
  { name: 'Entertainment', color: '#818CF8', type: 'EXPENSE', icon: 'FiFilm' },
  { name: 'Shopping', color: '#F472B6', type: 'EXPENSE', icon: 'FiShoppingBag' },
  { name: 'Home', color: '#A78BFA', type: 'EXPENSE', icon: 'FiHome' },
  { name: 'Utilities', color: '#34D399', type: 'EXPENSE', icon: 'FiHome' },
  { name: 'Groceries', color: '#10B981', type: 'EXPENSE', icon: 'FiShoppingCart' },
  { name: 'Healthcare', color: '#EC4899', type: 'EXPENSE', icon: 'FiUser' },
  { name: 'Education', color: '#8B5CF6', type: 'EXPENSE', icon: 'FiBriefcase' },
  { name: 'Salary', color: '#34D399', type: 'INCOME', icon: 'FiDollarSign' },
  { name: 'Freelance', color: '#A3E635', type: 'INCOME', icon: 'FiGlobe' },
  { name: 'Investment', color: '#FBBF24', type: 'INCOME', icon: 'FiTrendingUp' },
  { name: 'Gifts', color: '#F472B6', type: 'INCOME', icon: 'FiGift' },
  { name: 'Other Income', color: '#6EE7B7', type: 'INCOME', icon: 'FiDollarSign' },
];

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
    
    // Create sample categories
    const now = new Date().toISOString();
    const categories = DEFAULT_CATEGORIES.map(category => ({
      id: uuidv4(),
      userId,
      name: category.name,
      color: category.color,
      type: category.type,
      icon: category.icon,
      createdAt: now,
      updatedAt: now
    }));
    
    // Get existing data
    const existingData = serverStorage.getItem(CATEGORIES_STORAGE_KEY) || '[]';
    const existingCategories = JSON.parse(existingData);
    
    // Filter out any existing categories for this user
    const otherCategories = existingCategories.filter(
      (cat: any) => cat.userId !== userId
    );
    
    // Save the combined data
    const allCategories = [...otherCategories, ...categories];
    serverStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(allCategories));
    
    return NextResponse.json({
      success: true,
      message: `Created ${categories.length} sample categories.`,
      categories
    });
    
  } catch (error) {
    console.error('Error creating sample categories:', error);
    return NextResponse.json({
      error: 'Failed to create sample categories',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 