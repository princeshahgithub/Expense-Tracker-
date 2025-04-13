'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import { useSettings } from '@/contexts/SettingsContext'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

export default function Analytics() {
  const { data: session, status } = useSession()
  const { formatCurrency, formatDate } = useSettings()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('month')
  const [selectedChart, setSelectedChart] = useState<string>('category')
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, lastRefresh])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions', {
        credentials: 'same-origin',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Loaded ${data.length} transactions for analytics`)
      setTransactions(data)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLastRefresh(Date.now())
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Analytics Require Authentication</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Please sign in to view your spending analytics</p>
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

  // Filter transactions based on selected timeframe
  const filterTransactionsByTimeframe = () => {
    const now = new Date()
    let startDate: Date
    
    switch (selectedTimeframe) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate = startOfMonth(now)
        break
      case '3months':
        startDate = startOfMonth(subMonths(now, 2))
        break
      case '6months':
        startDate = startOfMonth(subMonths(now, 5))
        break
      case 'year':
        startDate = startOfMonth(subMonths(now, 11))
        break
      default:
        startDate = startOfMonth(now)
    }
    
    return transactions.filter(transaction => {
      // Parse the transaction date correctly
      const txDate = typeof transaction.date === 'string' 
        ? parseISO(transaction.date) 
        : new Date(transaction.date)
        
      return (
        txDate >= startDate && 
        transaction.type === 'EXPENSE'
      )
    })
  }

  // Prepare data for category chart
  const prepareCategoryChartData = () => {
    const filtered = filterTransactionsByTimeframe()
    const categoryMap = new Map()
    
    // Group expenses by category
    filtered.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Uncategorized'
      const amount = Number(transaction.amount)
      
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, categoryMap.get(categoryName) + amount)
      } else {
        categoryMap.set(categoryName, amount)
      }
    })
    
    // Sort categories by amount
    const sortedCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
    
    return {
      labels: sortedCategories.map(([category]) => category),
      datasets: [
        {
          data: sortedCategories.map(([, amount]) => amount),
          backgroundColor: sortedCategories.map(([category, _]) => {
            // Find a transaction with this category to get its color
            const transaction = filtered.find(t => t.category?.name === category)
            return transaction?.category?.color || '#' + Math.floor(Math.random()*16777215).toString(16)
          }),
          borderWidth: 1,
        },
      ],
    }
  }

  // Prepare data for monthly trend chart
  const prepareMonthlyTrendData = () => {
    const now = new Date()
    let months: Date[]
    
    switch (selectedTimeframe) {
      case '3months':
        months = Array.from({ length: 3 }, (_, i) => subMonths(now, i))
        break
      case '6months':
        months = Array.from({ length: 6 }, (_, i) => subMonths(now, i))
        break
      case 'year':
        months = Array.from({ length: 12 }, (_, i) => subMonths(now, i))
        break
      default:
        // Default to showing at least 3 months for better trend visualization
        months = Array.from({ length: 3 }, (_, i) => subMonths(now, i))
    }
    
    // Reverse to get chronological order (oldest to newest)
    months = months.reverse()
    
    const monthlyData = months.map(month => {
      const start = startOfMonth(month)
      const end = endOfMonth(month)
      
      // Get all expenses for this month
      const monthlyExpenses = transactions
        .filter(transaction => {
          // Parse the transaction date correctly
          const txDate = typeof transaction.date === 'string' 
            ? parseISO(transaction.date) 
            : new Date(transaction.date)
            
          return (
            transaction.type === 'EXPENSE' && 
            txDate >= start && 
            txDate <= end
          )
        })
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
        
      // Get all income for this month
      const monthlyIncome = transactions
        .filter(transaction => {
          // Parse the transaction date correctly
          const txDate = typeof transaction.date === 'string' 
            ? parseISO(transaction.date) 
            : new Date(transaction.date)
            
          return (
            transaction.type === 'INCOME' && 
            txDate >= start && 
            txDate <= end
          )
        })
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
        
      // Calculate net balance for this month
      const netBalance = monthlyIncome - monthlyExpenses
        
      return {
        month: format(month, 'MMM yyyy'),
        expenses: monthlyExpenses,
        income: monthlyIncome,
        netBalance: netBalance
      }
    })
    
    return {
      labels: monthlyData.map(data => data.month),
      datasets: [
        {
          label: 'Expenses',
          data: monthlyData.map(data => data.expenses),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Income',
          data: monthlyData.map(data => data.income),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Net Balance',
          data: monthlyData.map(data => data.netBalance),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          borderDash: [5, 5],
        }
      ],
    }
  }

  // Prepare data for daily spending chart
  const prepareDailySpendingData = () => {
    const now = new Date()
    let startDate: Date
    let interval: Date[]
    
    switch (selectedTimeframe) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        interval = eachDayOfInterval({ start: startDate, end: now })
        break
      case 'month':
        startDate = startOfMonth(now)
        interval = eachDayOfInterval({ start: startDate, end: now })
        break
      case '3months':
        // For 3 months, show weekly data instead of daily to avoid overcrowding
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 90) // approximately 3 months
        // Create weekly intervals
        interval = []
        let current = new Date(startDate)
        while (current <= now) {
          interval.push(new Date(current))
          current.setDate(current.getDate() + 7) // add 7 days
        }
        if (interval[interval.length - 1] < now) {
          interval.push(now) // add the last day if it's not included
        }
        break
      default:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        interval = eachDayOfInterval({ start: startDate, end: now })
    }
    
    const dailyData = interval.map(day => {
      // Create date at midnight in user's local timezone
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0)
      
      // Create date at 23:59:59 in user's local timezone
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
      
      // Filter transactions for this day
      const dailyExpenses = transactions
        .filter(transaction => {
          // Parse the transaction date correctly - handling both string and Date objects
          const txDate = typeof transaction.date === 'string' 
            ? parseISO(transaction.date) 
            : new Date(transaction.date)
            
          return (
            transaction.type === 'EXPENSE' && 
            txDate >= dayStart && 
            txDate <= dayEnd
          )
        })
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
        
      return {
        day: selectedTimeframe === '3months' 
          ? `${format(day, 'MMM dd')}-${
              interval[interval.indexOf(day) + 1] 
                ? format(interval[interval.indexOf(day) + 1], 'MMM dd') 
                : format(now, 'MMM dd')
            }`
          : format(day, 'MMM dd'),
        expenses: dailyExpenses
      }
    })
    
    return {
      labels: dailyData.map(data => data.day),
      datasets: [
        {
          label: selectedTimeframe === '3months' ? 'Weekly Spending' : 'Daily Spending',
          data: dailyData.map(data => data.expenses),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          // Add a border color to make the bars more visible
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1,
        }
      ],
    }
  }

  // Calculate total spending for selected period
  const totalSpending = filterTransactionsByTimeframe()
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)

  // Get top categories for selected period
  const getTopCategories = () => {
    const filtered = filterTransactionsByTimeframe()
    const categoryMap = new Map()
    
    // Group expenses by category
    filtered.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Uncategorized'
      const amount = Number(transaction.amount)
      const color = transaction.category?.color || '#cccccc'
      
      if (categoryMap.has(categoryName)) {
        const existing = categoryMap.get(categoryName)
        existing.amount += amount
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          amount: amount,
          color: color
        })
      }
    })
    
    // Sort categories by amount and take top 3
    return Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
  }

  const topCategories = getTopCategories()

  // Customize chart tooltips to use formatCurrency
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: 'gray',
          usePointStyle: true
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'gray',
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
      x: {
        ticks: {
          color: 'gray',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Create special options for line charts with better styling
  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        mode: 'index' as const,
        intersect: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        }
      },
      x: {
        ...chartOptions.scales.x,
        grid: {
          display: false
        }
      }
    }
  };

  // Customize pie chart tooltips
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = formatCurrency(context.raw);
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      legend: {
        position: 'right' as const,
        labels: {
          color: 'gray',
          usePointStyle: true
        }
      }
    }
  };

  // Choose which chart to display based on selection
  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'category':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
            <div className="h-[400px]">
              <Pie data={prepareCategoryChartData()} options={pieChartOptions} />
            </div>
          </div>
        )
      case 'trend':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Trend</h3>
            <div className="h-[400px]">
              <Line data={prepareMonthlyTrendData()} options={lineChartOptions} />
            </div>
          </div>
        )
      case 'daily':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Spending</h3>
            <div className="h-[400px]">
              <Bar data={prepareDailySpendingData()} options={chartOptions} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize your spending habits over time</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Refresh data"
        >
          Refresh Data
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex-1 min-w-[250px]">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Time Period</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedTimeframe('week')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedTimeframe === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Last Week
            </button>
            <button 
              onClick={() => setSelectedTimeframe('month')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedTimeframe === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              This Month
            </button>
            <button 
              onClick={() => setSelectedTimeframe('3months')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedTimeframe === '3months' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              3 Months
            </button>
            <button 
              onClick={() => setSelectedTimeframe('6months')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedTimeframe === '6months' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              6 Months
            </button>
            <button 
              onClick={() => setSelectedTimeframe('year')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedTimeframe === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              1 Year
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex-1 min-w-[250px]">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Chart Type</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedChart('category')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedChart === 'category' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              By Category
            </button>
            <button 
              onClick={() => setSelectedChart('trend')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedChart === 'trend' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Income vs Expenses
            </button>
            <button 
              onClick={() => setSelectedChart('daily')}
              className={`px-3 py-1.5 text-sm rounded-md ${
                selectedChart === 'daily' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Daily Spending
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Spending</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(totalSpending)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedTimeframe === 'week' 
              ? 'in the past week' 
              : selectedTimeframe === 'month'
              ? 'this month'
              : selectedTimeframe === '3months'
              ? 'in past 3 months'
              : selectedTimeframe === '6months'
              ? 'in past 6 months'
              : 'in the past year'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Top Spending Categories</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No expenses in this period</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Transactions</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {filterTransactionsByTimeframe().length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            expense transactions
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="mb-8">
        {renderSelectedChart()}
      </div>
    </div>
  )
} 