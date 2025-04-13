'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiGlobe, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { useSettings } from '@/contexts/SettingsContext'
import { useTranslation } from '@/contexts/TranslationContext'

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { settings, updateSettings } = useSettings()
  const { t } = useTranslation()
  const [formData, setFormData] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: newValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await updateSettings(formData)
      setSuccessMessage(t('common.settingsSaved'))
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setError(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p className="text-lg font-medium text-gray-900 dark:text-white">{t('common.loading')}</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('common.settings')}</h1>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                <FiDollarSign className="w-4 h-4 mr-2" />
                {t('settings.currency')}
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input-field"
                aria-label={t('settings.currency')}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                <FiCalendar className="w-4 h-4 mr-2" />
                {t('settings.dateFormat')}
              </label>
              <select
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                className="input-field"
                aria-label={t('settings.dateFormat')}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                <FiGlobe className="w-4 h-4 mr-2" />
                {t('settings.language')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="input-field"
                aria-label={t('settings.language')}
              >
                <option value="en">English</option>
                <option value="es">Spanish (Español)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 btn-primary flex items-center justify-center"
            >
              {isSaving ? t('common.saving') : t('settings.saveSettings')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 