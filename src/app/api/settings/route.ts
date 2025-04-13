import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Define settings schema
const SettingsSchema = z.object({
  currency: z.string(),
  dateFormat: z.string(),
  language: z.string()
})

// Default settings
const defaultSettings = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  language: 'en'
}

// Fallback storage for when database is not available
let memoryStorage: Record<string, any> = {}

// Helper function to get user settings
const getUserSettings = async (userId: string) => {
  try {
    // Try to get settings from database
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    })
    
    if (settings) {
      // Remove any theme and notification properties that might exist
      const { theme, notificationsEnabled, emailNotifications, budgetAlerts, ...cleanSettings } = settings;
      
      // Update memory storage as backup
      memoryStorage[userId] = cleanSettings
      return cleanSettings
    }

    // If no settings in database, check memory storage
    if (memoryStorage[userId]) {
      return memoryStorage[userId]
    }

    // If no settings found anywhere, return defaults
    return defaultSettings
  } catch (error) {
    console.error('Error getting user settings from database:', error)
    
    // On database error, try memory storage
    if (memoryStorage[userId]) {
      return memoryStorage[userId]
    }
    
    return defaultSettings
  }
}

// Helper function to save user settings
const saveUserSettings = async (userId: string, settings: any) => {
  try {
    // Try to save to database first
    await prisma.userSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings
      }
    })

    // Update memory storage as backup
    memoryStorage[userId] = settings
    return true
  } catch (error) {
    console.error('Error saving user settings to database:', error)
    
    // On database error, save to memory storage
    try {
      memoryStorage[userId] = settings
      return true
    } catch (memoryError) {
      console.error('Error saving to memory storage:', memoryError)
      return false
    }
  }
}

export async function GET() {
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

    const settings = await getUserSettings(userId)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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

    const json = await request.json()
    
    try {
      const settings = SettingsSchema.parse(json)
      
      const success = await saveUserSettings(userId, settings)
      if (success) {
        return NextResponse.json(settings)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
        return NextResponse.json({ 
          error: 'Validation Error', 
          details: errorDetails 
        }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error('Error in PUT /api/settings:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 