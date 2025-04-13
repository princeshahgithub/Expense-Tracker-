'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  getDay
} from 'date-fns'
import { FiChevronLeft, FiChevronRight, FiDollarSign } from 'react-icons/fi'
import { useSettings } from '@/contexts/SettingsContext'
import { useTranslation } from '@/contexts/TranslationContext'

export default function Calendar() {
  const { data: session, status } = useSession()
  const { formatCurrency, formatDate } = useSettings()
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (status === 'authenticated') {
        try {
          setLoading(true)
          const response = await fetch('/api/transactions', {
            credentials: 'same-origin'
          })
          
          if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.status}`)
          }
          
          const data = await response.json()
          setTransactions(data)
        } catch (err) {
          console.error('Error fetching transactions:', err)
          setError(err instanceof Error ? err.message : 'Failed to load transactions')
        } finally {
          setLoading(false)
        }
      } else if (status === 'unauthenticated') {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Calendar Requires Authentication</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Please sign in to view your transaction calendar</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    )
  }

  // Navigation functions
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Get days of current month view
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = monthStart
    const endDate = monthEnd
    
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const dayOfWeek = getDay(monthStart)
    
    // Add empty cells for days before the start of the month
    const emptyDays = Array.from({ length: dayOfWeek }, (_, i) => (
      <div key={`empty-${i}`} className="h-32 border border-gray-200 dark:border-gray-700"></div>
    ))
    
    // Group transactions by date for quick lookup
    const transactionsByDate: Record<string, any[]> = {}
    
    transactions.forEach(transaction => {
      const dateStr = format(new Date(transaction.date), 'yyyy-MM-dd')
      if (!transactionsByDate[dateStr]) {
        transactionsByDate[dateStr] = []
      }
      transactionsByDate[dateStr].push(transaction)
    })
    
    const daysWithTransactions = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const isSelectedDay = selectedDate && isSameDay(day, selectedDate)
      const isTodayDay = isToday(day)
      
      // Get transactions for this day
      const dayTransactions = transactionsByDate[dateStr] || []
      
      // Calculate total income and expense for this day
      const totalIncome = dayTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)
        
      const totalExpense = dayTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return (
        <div 
          key={dateStr}
          onClick={() => setSelectedDate(day)}
          className={`h-32 border border-gray-200 dark:border-gray-700 p-2 overflow-hidden transition-colors cursor-pointer
            ${isSelectedDay ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
            ${isTodayDay ? 'border-blue-500 dark:border-blue-400' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${
              isTodayDay 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {format(day, 'd')}
            </span>
            
            {(totalIncome > 0 || totalExpense > 0) && (
              <div className="flex flex-col items-end">
                {totalIncome > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    {formatCurrency(totalIncome)}
                  </span>
                )}
                {totalExpense > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mt-1">
                    {formatCurrency(totalExpense)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {dayTransactions.length > 0 && (
            <div className="mt-1 space-y-1 overflow-hidden max-h-[80px]">
              {dayTransactions.slice(0, 2).map(transaction => (
                <div 
                  key={transaction.id}
                  className="text-xs truncate flex items-center"
                >
                  <span 
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: transaction.category.color }}
                  ></span>
                  <span className={`${
                    transaction.type === 'INCOME' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.title}
                  </span>
                </div>
              ))}
              
              {dayTransactions.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  + {dayTransactions.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      )
    })
    
    return [...emptyDays, ...daysWithTransactions]
  }

  // Get transactions for selected date
  const getSelectedDayTransactions = () => {
    if (!selectedDate) return []
    
    return transactions.filter(transaction => 
      isSameDay(new Date(transaction.date), selectedDate)
    )
  }

  // Calculate total income and expense for selected date
  const getSelectedDayTotals = () => {
    const dayTransactions = getSelectedDayTransactions()
    
    const totalIncome = dayTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
      
    const totalExpense = dayTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
      
    return { totalIncome, totalExpense, net: totalIncome - totalExpense }
  }

  const { totalIncome, totalExpense, net } = selectedDate ? getSelectedDayTotals() : { totalIncome: 0, totalExpense: 0, net: 0 }
  const selectedDayTransactions = selectedDate ? getSelectedDayTransactions() : []

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('navigation.calendar')}</h1>
        <p className="text-gray-600 dark:text-gray-400">View your financial activity by date</p>
      </div>
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('calendar.today')}
          </button>
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-px">
          {weekdays.map(day => (
            <div 
              key={day} 
              className="text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {renderCalendarDays()}
        </div>
      </div>
      
      {/* Selected Day Details */}
      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('calendar.transactionsFor', { date: format(selectedDate, 'MMMM d, yyyy') })}
            </h3>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.income')}</p>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.expense')}</p>
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.net')}</p>
                <p className={`text-lg font-medium ${
                  net >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(net)}
                </p>
              </div>
            </div>
          </div>
          
          {selectedDayTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {selectedDayTransactions.map(transaction => (
                <div 
                  key={transaction.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'INCOME' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <FiDollarSign className={`h-5 w-5 ${
                        transaction.type === 'INCOME' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.title}</p>
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.amount > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('calendar.noTransactionsOnDate')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 