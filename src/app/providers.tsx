'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { TranslationProvider } from '@/contexts/TranslationContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <TranslationProvider>
        {children}
        </TranslationProvider>
      </SettingsProvider>
    </SessionProvider>
  )
} 