'use client'

import React, { createContext, useContext } from 'react'
import { translations, getTranslationValue, TranslationPath } from '@/locales'
import { useSettings } from './SettingsContext'

interface TranslationContextType {
  t: (key: TranslationPath, params?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  
  // Translation function
  const t = (key: TranslationPath, params?: Record<string, string>): string => {
    const languageCode = settings.language || 'en'
    
    // Get translation from the current language or fallback to English
    const currentTranslations = translations[languageCode as keyof typeof translations] || translations.en
    let translated = getTranslationValue(currentTranslations, key) || getTranslationValue(translations.en, key) || key
    
    // Replace parameters if any
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translated = translated.replace(`{${paramKey}}`, paramValue)
      })
    }
    
    return translated
  }
  
  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
} 