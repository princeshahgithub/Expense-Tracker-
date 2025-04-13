'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserSettings {
  currency: string;
  dateFormat: string;
  language: string;
}

const defaultSettings: UserSettings = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  language: 'en'
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  // Fetch settings when session is available
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchSettings()
    }
  }, [status, session])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency
    }).format(amount)
  }

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(settings.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency, formatDate }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 