import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns'
import { prisma } from '@/lib/prisma'

// Storage key for transactions
const TRANSACTIONS_STORAGE_KEY = 'expense-tracker-transactions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      console.error('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Current month range for monthly calculations
    const currentMonth = new Date()
    const startOfCurrentMonth = startOfMonth(currentMonth)
    const endOfCurrentMonth = endOfMonth(currentMonth)

    // Get all transactions for this user with their categories
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: user.id 
      },
      include: {
        category: true
      }
    })

    // Calculate total balance (all income - all expenses)
    const totalBalance = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'INCOME') {
        return acc + Number(transaction.amount)
      } else {
        return acc - Number(transaction.amount)
      }
    }, 0)

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(transaction => {
      const txDate = new Date(transaction.date)
      return txDate >= startOfCurrentMonth && txDate <= endOfCurrentMonth
    })

    // Calculate monthly income (only income transactions for current month)
    const monthlyIncome = currentMonthTransactions
      .filter(transaction => transaction.type === 'INCOME')
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0)

    // Calculate monthly expenses (only expense transactions for current month)
    const monthlyExpenses = currentMonthTransactions
      .filter(transaction => transaction.type === 'EXPENSE')
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0)

    // Calculate savings rate with proper handling for edge cases
    let savingsRate = 0
    if (monthlyIncome > 0) {
      savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    } else if (monthlyExpenses > 0) {
      // If no income but there are expenses, savings rate is -100%
      savingsRate = -100
    }
    // If both income and expenses are 0, savings rate remains 0

    // Get 5 most recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 5)

    // Format transactions for the response
    const formattedTransactions = recentTransactions.map(transaction => {
      return {
        id: transaction.id,
        title: transaction.title || 'Transaction',
        amount: transaction.type === 'INCOME' ? Number(transaction.amount) : -Number(transaction.amount),
        date: transaction.date.toISOString(),
        category: transaction.category?.name || 'Uncategorized',
        categoryColor: transaction.category?.color || '#CBD5E0',  // Default gray
      }
    })

    const dashboardData = {
      summaryData: {
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
        monthlyExpenses: parseFloat(monthlyExpenses.toFixed(2)),
        savingsRate: parseFloat(savingsRate.toFixed(2)),
      },
      recentTransactions: formattedTransactions,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 