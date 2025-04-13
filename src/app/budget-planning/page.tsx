'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/contexts/TranslationContext'
import { useSettings } from '@/contexts/SettingsContext'
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiAlertCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

// Define types first
type Category = {
  id: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
}

type BudgetCategory = {
  id: number;
  categoryId: string;
  limit: number;
  spent: number;
}

type Budget = {
  id: number;
  name: string;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate?: string;
  categories: BudgetCategory[];
}

type Transaction = {
  id: number;
  title: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: {
    id: string;
    name: string;
    color: string;
    type: 'INCOME' | 'EXPENSE';
  };
}

// Mock data for the demo
const mockCategories: Category[] = [
  { id: '1', name: 'Home', color: '#A78BFA', type: 'EXPENSE' },
  { id: '3', name: 'Food', color: '#F87171', type: 'EXPENSE' },
  { id: '5', name: 'Transportation', color: '#60A5FA', type: 'EXPENSE' },
  { id: '6', name: 'Entertainment', color: '#818CF8', type: 'EXPENSE' },
  { id: '7', name: 'Shopping', color: '#F472B6', type: 'EXPENSE' },
  { id: '9', name: 'Healthcare', color: '#34D399', type: 'EXPENSE' },
  { id: '10', name: 'Education', color: '#FBBF24', type: 'EXPENSE' }
]

// Mock past transactions (would be fetched from API in a real app)
const mockTransactions: Transaction[] = [
  { id: 1, title: 'Rent', amount: 1200, date: '2023-10-01', type: 'EXPENSE', category: { id: '1', name: 'Home', color: '#A78BFA', type: 'EXPENSE' } },
  { id: 2, title: 'Electricity', amount: 85, date: '2023-10-05', type: 'EXPENSE', category: { id: '2', name: 'Home', color: '#A78BFA', type: 'EXPENSE' } },
  { id: 3, title: 'Groceries', amount: 150, date: '2023-10-08', type: 'EXPENSE', category: { id: '3', name: 'Food', color: '#F87171', type: 'EXPENSE' } },
  { id: 4, title: 'Restaurant', amount: 65, date: '2023-10-12', type: 'EXPENSE', category: { id: '4', name: 'Food', color: '#F87171', type: 'EXPENSE' } },
  { id: 5, title: 'Gas', amount: 45, date: '2023-10-14', type: 'EXPENSE', category: { id: '5', name: 'Transportation', color: '#60A5FA', type: 'EXPENSE' } },
  { id: 6, title: 'Movie night', amount: 35, date: '2023-10-15', type: 'EXPENSE', category: { id: '6', name: 'Entertainment', color: '#818CF8', type: 'EXPENSE' } },
  { id: 7, title: 'Clothing', amount: 120, date: '2023-10-18', type: 'EXPENSE', category: { id: '7', name: 'Shopping', color: '#F472B6', type: 'EXPENSE' } },
  { id: 8, title: 'Internet', amount: 75, date: '2023-10-20', type: 'EXPENSE', category: { id: '8', name: 'Home', color: '#A78BFA', type: 'EXPENSE' } },
  { id: 9, title: 'Groceries', amount: 125, date: '2023-10-22', type: 'EXPENSE', category: { id: '3', name: 'Food', color: '#F87171', type: 'EXPENSE' } },
  { id: 10, title: 'Doctor visit', amount: 30, date: '2023-10-25', type: 'EXPENSE', category: { id: '9', name: 'Healthcare', color: '#34D399', type: 'EXPENSE' } },
  { id: 11, title: 'Uber', amount: 25, date: '2023-10-28', type: 'EXPENSE', category: { id: '5', name: 'Transportation', color: '#60A5FA', type: 'EXPENSE' } },
  { id: 12, title: 'Books', amount: 50, date: '2023-10-30', type: 'EXPENSE', category: { id: '10', name: 'Education', color: '#FBBF24', type: 'EXPENSE' } },
  
  // Previous month
  { id: 13, title: 'Rent', amount: 1200, date: '2023-09-01', type: 'EXPENSE', category: { id: '1', name: 'Home', color: '#A78BFA', type: 'EXPENSE' } },
  { id: 14, title: 'Electricity', amount: 90, date: '2023-09-05', type: 'EXPENSE', category: { id: '2', name: 'Home', color: '#A78BFA', type: 'EXPENSE' } },
  { id: 15, title: 'Groceries', amount: 180, date: '2023-09-07', type: 'EXPENSE', category: { id: '3', name: 'Food', color: '#F87171', type: 'EXPENSE' } },
  { id: 16, title: 'Restaurant', amount: 55, date: '2023-09-13', type: 'EXPENSE', category: { id: '4', name: 'Food', color: '#F87171', type: 'EXPENSE' } },
  { id: 17, title: 'Gas', amount: 50, date: '2023-09-15', type: 'EXPENSE', category: { id: '5', name: 'Transportation', color: '#60A5FA', type: 'EXPENSE' } },
  { id: 18, title: 'Concert tickets', amount: 120, date: '2023-09-18', type: 'EXPENSE', category: { id: '6', name: 'Entertainment', color: '#818CF8', type: 'EXPENSE' } },
  { id: 19, title: 'Shoes', amount: 85, date: '2023-09-20', type: 'EXPENSE', category: { id: '7', name: 'Shopping', color: '#F472B6', type: 'EXPENSE' } },
  { id: 20, title: 'Internet', amount: 75, date: '2023-09-22', type: 'EXPENSE', category: { id: '2', name: 'Home', color: '#A78BFA', type: 'EXPENSE' } },
  { id: 21, title: 'Groceries', amount: 140, date: '2023-09-24', type: 'EXPENSE', category: { id: '3', name: 'Food', color: '#F87171', type: 'EXPENSE' } },
  { id: 22, title: 'Pharmacy', amount: 45, date: '2023-09-26', type: 'EXPENSE', category: { id: '9', name: 'Healthcare', color: '#34D399', type: 'EXPENSE' } },
  { id: 23, title: 'Bus pass', amount: 60, date: '2023-09-01', type: 'EXPENSE', category: { id: '5', name: 'Transportation', color: '#60A5FA', type: 'EXPENSE' } },
  { id: 24, title: 'Online course', amount: 70, date: '2023-09-29', type: 'EXPENSE', category: { id: '10', name: 'Education', color: '#FBBF24', type: 'EXPENSE' } }
]

const mockBudgets: Budget[] = []

export default function BudgetPlanning() {
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  const { formatCurrency } = useSettings()
  
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    name: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    categories: []
  })
  const [expandedCategory, setExpandedCategory] = useState<{budgetId: number, categoryId: string} | null>(null)

  // Add localStorage persistence functions
  const saveBudgetsToStorage = (budgetsToSave: Budget[]) => {
    try {
      localStorage.setItem('userBudgets', JSON.stringify(budgetsToSave));
      console.log('Budgets saved to localStorage');
    } catch (error) {
      console.error('Error saving budgets to localStorage:', error);
    }
  };

  const loadBudgetsFromStorage = (): Budget[] => {
    try {
      const savedBudgets = localStorage.getItem('userBudgets');
      if (savedBudgets) {
        const parsedBudgets = JSON.parse(savedBudgets) as Budget[];
        console.log('Loaded budgets from localStorage:', parsedBudgets.length);
        return parsedBudgets;
      }
    } catch (error) {
      console.error('Error loading budgets from localStorage:', error);
    }
    return [];
  };

  // Add fetchCategories function inside component
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      const expenseCategories = data.filter((cat: Category) => cat.type === 'EXPENSE');
      
      if (expenseCategories.length > 0) {
        setCategories(expenseCategories);
        return true;
      } else {
        console.warn('No expense categories found in API response');
        setCategories(mockCategories); // Use mock data as fallback
        return true; // Return true since we have set categories
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(mockCategories); // Use mock data as fallback
      return true; // Return true since we have set categories
    }
  };

  // Modify the fetchTransactions function to automatically update budget progress
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data);
      
      // Automatically update budget progress when transactions are loaded
      if (budgets.length > 0) {
        setTimeout(() => refreshBudgetData(), 100);
      }
      
      return true;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions(mockTransactions); // Use mock data as fallback
      
      // Still update budgets with mock data
      if (budgets.length > 0) {
        setTimeout(() => refreshBudgetData(), 100);
      }
      
      return true;
    }
  };

  // Update the initial data loading useEffect
  useEffect(() => {
    if (status === 'authenticated') {
      // Set loading state
      setLoading(true);

      // Load saved budgets from localStorage first
      const savedBudgets = loadBudgetsFromStorage();
      
      // Use Promise.all to fetch both datasets in parallel
      Promise.all([fetchCategories(), fetchTransactions()])
        .then(() => {
          setTimeout(() => {
            // If we have saved budgets, use them and update their spending with transaction data
            if (savedBudgets.length > 0) {
              const updatedBudgets = updateBudgetSpending(savedBudgets);
              setBudgets(updatedBudgets);
            }
            setLoading(false);
          }, 500);
        })
        .catch(error => {
          console.error('Error initializing data:', error);
          // Still use saved budgets if API calls fail
          if (savedBudgets.length > 0) {
            setBudgets(savedBudgets);
          }
          setLoading(false);
        });
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  // Calculate suggested limits based on past transactions
  const calculateSuggestedLimits = (period: string = 'monthly') => {
    const categorySpending: Record<string, number[]> = {}
    
    // Init all categories
    categories.forEach(cat => {
      categorySpending[cat.id] = []
    })
    
    // Filter expenses from recent transactions
    const expenses = transactions.filter(t => t.type === 'EXPENSE')
    
    // Group expenses by category
    expenses.forEach(transaction => {
      const catId = transaction.category.id
      if (!categorySpending[catId]) {
        categorySpending[catId] = []
      }
      categorySpending[catId].push(transaction.amount)
    })
    
    // Calculate averages and adjust based on period
    const periodMultiplier = 
      period === 'weekly' ? 0.25 :   // 1/4 of monthly
      period === 'yearly' ? 12 :     // 12x monthly
      period === 'custom' ? 1 :      // Default to monthly
      1                              // Monthly
    
    // Calculate suggested limits for each category
    const suggestedLimits: Record<string, number> = {}
    
    Object.entries(categorySpending).forEach(([catId, amounts]) => {
      if (amounts.length === 0) {
        suggestedLimits[catId] = 0
        return
      }
      
      // Calculate average monthly spending
      const total = amounts.reduce((sum, amount) => sum + amount, 0)
      const average = amounts.length > 0 ? total / (amounts.length / 12) : 0
      
      // Round up to nearest 50 for nicer numbers and add 10% buffer
      const suggested = Math.ceil((average * periodMultiplier * 1.1) / 50) * 50
      
      suggestedLimits[catId] = suggested
    })
    
    return suggestedLimits
  }

  const applySuggestedLimits = () => {
    if (!newBudget.categories || !newBudget.period) return
    
    const suggestedLimits = calculateSuggestedLimits(newBudget.period)
    
    // Apply suggested limits to current categories
    const updatedCategories = newBudget.categories.map(cat => ({
      ...cat,
      limit: suggestedLimits[cat.categoryId] || 0
    }))
    
    setNewBudget({
      ...newBudget,
      categories: updatedCategories
    })
  }

  // Add a function to update budget spending based on transaction data
  const updateBudgetSpending = (budgetsToUpdate = budgets) => {
    // Only process if we have budgets
    if (!budgetsToUpdate || !budgetsToUpdate.length) return budgetsToUpdate;
    
    // Create updated copy of budgets
    const updatedBudgets = budgetsToUpdate.map(budget => {
      if (!budget) return budget;
      
      // Deep clone the budget object to avoid mutations
      const updatedBudget = { 
        ...budget, 
        categories: budget.categories?.map(c => ({...c})) || [] 
      };
      
      // Reset all spending amounts
      updatedBudget.categories = updatedBudget.categories.map(cat => ({
        ...cat,
        spent: 0
      }));
      
      if (!transactions || !transactions.length) {
        return updatedBudget;
      }
      
      try {
        // Filter transactions by date range
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = budget.endDate ? new Date(budget.endDate) : new Date();
        
        // For period-based budgets, calculate the proper date range
        let startDate = budgetStart;
        let endDate = budgetEnd;
        
        if (budget.period === 'monthly') {
          // Current month
          startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        } else if (budget.period === 'weekly') {
          // Current week (Sunday to Saturday)
          const today = new Date();
          const day = today.getDay(); // 0 = Sunday, 6 = Saturday
          startDate = new Date(today);
          startDate.setDate(today.getDate() - day); // Go to Sunday
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // Go to Saturday
        } else if (budget.period === 'yearly') {
          // Current year
          startDate = new Date(new Date().getFullYear(), 0, 1);
          endDate = new Date(new Date().getFullYear(), 11, 31);
        }
        
        // Filter relevant transactions
        const relevantTransactions = transactions.filter(t => {
          if (!t || !t.date || !t.type || !t.category) return false;
          
          try {
            const transactionDate = new Date(t.date);
            return (
              t.type === 'EXPENSE' && 
              transactionDate >= startDate && 
              transactionDate <= endDate
            );
          } catch (e) {
            console.error('Error processing transaction date:', e);
            return false;
          }
        });
        
        // Update category spending based on transactions
        relevantTransactions.forEach(transaction => {
          if (!transaction.category?.id) return;
          
          const matchingCategory = updatedBudget.categories.find(
            cat => cat.categoryId === transaction.category.id
          );
          
          if (matchingCategory) {
            matchingCategory.spent += transaction.amount;
          }
        });
      } catch (error) {
        console.error('Error updating budget spending:', error);
      }
      
      return updatedBudget;
    });
    
    return updatedBudgets;
  }

  // Add a function to refresh budget data from transactions
  const refreshBudgetData = () => {
    const updatedBudgets = updateBudgetSpending()
    setBudgets(updatedBudgets)
    
    // Save to localStorage
    saveBudgetsToStorage(updatedBudgets)
  }

  // Add function to get relevant transactions for a specific category in a budget
  const getTransactionsForCategory = (budgetId: number, categoryId: string) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (!budget) return []
    
    // Calculate date range based on budget period
    let startDate = new Date(budget.startDate)
    let endDate = budget.endDate ? new Date(budget.endDate) : new Date()
    
    if (budget.period === 'monthly') {
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    } else if (budget.period === 'weekly') {
      const today = new Date()
      const day = today.getDay()
      startDate = new Date(today)
      startDate.setDate(today.getDate() - day)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
    } else if (budget.period === 'yearly') {
      startDate = new Date(new Date().getFullYear(), 0, 1)
      endDate = new Date(new Date().getFullYear(), 11, 31)
    }
    
    // Filter transactions by date range and category
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return (
        t.type === 'EXPENSE' && 
        t.category.id === categoryId &&
        transactionDate >= startDate && 
        transactionDate <= endDate
      )
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Add a useEffect that watches for transaction changes to update budgets
  useEffect(() => {
    // Only run if we have both budgets and transactions
    if (budgets.length > 0 && transactions.length > 0 && !loading) {
      // Update budget progress when transactions change
      const updatedBudgets = updateBudgetSpending();
      setBudgets(updatedBudgets);
      
      // Save to localStorage
      saveBudgetsToStorage(updatedBudgets);
    }
  }, [transactions, loading]);

  // Modify the useEffect interval to run more frequently for better real-time feeling
  useEffect(() => {
    if (status === 'authenticated' && !loading) {
      // Initial update on load
      if (budgets.length > 0) {
        refreshBudgetData();
      }
      
      // Set up an interval to refresh budget data every 30 seconds
      // This would simulate real-time syncing with transactions
      const intervalId = setInterval(() => {
        fetchTransactions(); // Automatically triggers budget updates via the useEffect
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [status, loading, budgets.length]);

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Budget Planning Requires Authentication</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Please sign in to view your budget planning</p>
        </div>
      </div>
    )
  }

  const handleCreateBudget = () => {
    setIsCreating(true)
    setNewBudget({
      name: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      categories: []
    })
  }

  const handleAddCategory = () => {
    console.log("Adding category, current state:", { categories, newBudget });
    
    // Ensure we have a valid categories array to work with
    const currentCategories = Array.isArray(newBudget.categories) ? [...newBudget.categories] : [];
    
    // Make sure we have categories to choose from
    if (!categories || categories.length === 0) {
      // Create a temporary dummy category if necessary
      const dummyCategory = { id: '1', name: 'Home', color: '#A78BFA', type: 'EXPENSE' as 'EXPENSE' };
      
      const defaultCategory = { 
        id: currentCategories.length + 1, 
        categoryId: dummyCategory.id,
        limit: 0, 
        spent: 0 
      };
      
      // Update state with the default category
      setNewBudget(prevBudget => ({
        ...prevBudget,
        categories: [...currentCategories, defaultCategory]
      }));
      
      console.log("Added default category since no categories were loaded");
      return;
    }
    
    // Get all expense categories
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
    if (expenseCategories.length === 0) {
      // Create a default category if no expense categories are available
      const defaultCategory = { 
        id: currentCategories.length + 1, 
        categoryId: '1', // Default Home category ID
        limit: 0, 
        spent: 0 
      };
      
      // Update state with the default category
      setNewBudget(prevBudget => ({
        ...prevBudget,
        categories: [...currentCategories, defaultCategory]
      }));
      
      console.log("Added default category since no expense categories were available");
      return;
    }
    
    // Generate a unique ID that doesn't exist in the current categories
    let maxId = 0;
    if (currentCategories.length > 0) {
      maxId = Math.max(...currentCategories.map(c => typeof c.id === 'number' ? c.id : 0));
    }
    const newId = maxId + 1;
    console.log("Generated new category ID:", newId);
    
    // Create the new category object
    const newCategory = { 
      id: newId, 
      categoryId: expenseCategories[0].id,
      limit: 0, 
      spent: 0 
    };
    
    // Create a new array with the added category
    const updatedCategories = [...currentCategories, newCategory];
    
    // Update state with the new category
    setNewBudget(prevBudget => ({
      ...prevBudget,
      categories: updatedCategories
    }));
    
    console.log("Updated budget with new category:", updatedCategories);
  }

  const handleRemoveCategory = (index: number) => {
    if (!newBudget.categories) return
    
    setNewBudget({
      ...newBudget,
      categories: newBudget.categories.filter((_, i) => i !== index)
    })
  }

  const handleCategoryChange = (index: number, field: string, value: any) => {
    if (!newBudget.categories) return
    
    const updatedCategories = [...newBudget.categories]
    
    if (field === 'categoryId') {
      updatedCategories[index] = {
        ...updatedCategories[index],
        categoryId: value
      }
    } else if (field === 'limit') {
      updatedCategories[index] = {
        ...updatedCategories[index],
        limit: parseFloat(value)
      }
    }
    
    setNewBudget({
      ...newBudget,
      categories: updatedCategories
    })
  }

  const handleEditBudget = (id: number) => {
    const budgetToEdit = budgets.find(b => b.id === id)
    if (!budgetToEdit) return
    
    setIsEditing(id)
    setIsCreating(true) // Reuse the same form
    setNewBudget({
      ...budgetToEdit,
      startDate: budgetToEdit.startDate.split('T')[0],
      endDate: budgetToEdit.endDate ? budgetToEdit.endDate.split('T')[0] : undefined
    })
  }

  const handleSaveBudget = () => {
    // Form validation 
    let hasErrors = false;
    const errors = [];
    
    if (!newBudget.name?.trim()) {
      errors.push('Budget name is required');
      hasErrors = true;
    }
    
    if (!newBudget.period) {
      errors.push('Budget period is required');
      hasErrors = true;
    }
    
    if (!newBudget.startDate) {
      errors.push('Start date is required');
      hasErrors = true;
    }
    
    if (newBudget.period === 'custom' && !newBudget.endDate) {
      errors.push('End date is required for custom budget periods');
      hasErrors = true;
    }
    
    if (!newBudget.categories?.length) {
      errors.push('At least one category is required');
      hasErrors = true;
    } else {
      // Check if categories have valid limits
      const invalidCategories = newBudget.categories.filter(c => 
        isNaN(c.limit) || c.limit < 0
      );
      
      if (invalidCategories.length > 0) {
        errors.push('All categories must have valid limits (0 or greater)');
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }
    
    // Prepare budget data
    let budgetToSave: Budget;
    
    try {
      if (isEditing) {
        // Update existing budget
        budgetToSave = { 
          ...newBudget, 
          id: isEditing,
          categories: newBudget.categories?.map(c => ({
            ...c,
            id: typeof c.id === 'number' ? c.id : Math.random(), // Ensure valid IDs
            limit: Number(c.limit) // Ensure numeric limits
          })) || []
        } as Budget;
        
        // Preserve existing 'spent' values for categories that already exist
        const existingBudget = budgets.find(b => b.id === isEditing);
        if (existingBudget) {
          budgetToSave.categories = budgetToSave.categories.map(newCat => {
            const existingCat = existingBudget.categories.find(c => c.categoryId === newCat.categoryId);
            return {
              ...newCat,
              spent: existingCat ? existingCat.spent : 0
            };
          });
        }
        
        const updatedBudgets = budgets.map(budget => 
          budget.id === isEditing ? budgetToSave : budget
        );
        setBudgets(updatedBudgets);
        
        // Save to localStorage
        saveBudgetsToStorage(updatedBudgets);
      } else {
        // Create new budget
        const newId = budgets.length > 0 ? 
          Math.max(...budgets.map(b => b.id)) + 1 : 1;
        
        budgetToSave = {
          ...newBudget,
          id: newId,
          categories: newBudget.categories?.map(c => ({
            ...c,
            id: typeof c.id === 'number' ? c.id : Math.random(), // Ensure valid IDs
            limit: Number(c.limit) // Ensure numeric limits
          })) || []
        } as Budget;
        
        // Calculate initial spending from transactions
        const processedBudgets = updateBudgetSpending([budgetToSave]);
        const processedBudget = processedBudgets?.[0] || budgetToSave;
        
        const newBudgets = [...budgets, processedBudget];
        setBudgets(newBudgets);
        
        // Save to localStorage
        saveBudgetsToStorage(newBudgets);
      }
      
      // Reset state
      setIsCreating(false);
      setIsEditing(null);
      
      // Show success message (would use a toast in a real app)
      alert(isEditing ? 'Budget updated successfully!' : t('budget.budgetSaved'));
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('An error occurred while saving the budget. Please try again.');
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setIsEditing(null)
  }

  const handleDeleteBudget = (id: number) => {
    if (window.confirm(t('budget.confirmDelete'))) {
      const updatedBudgets = budgets.filter(b => b.id !== id);
      setBudgets(updatedBudgets);
      
      // Save to localStorage
      saveBudgetsToStorage(updatedBudgets);
      
      // Show success message
      alert(t('budget.budgetDeleted'));
    }
  }

  const calculateProgress = (budget: Budget) => {
    const totalLimit = budget.categories.reduce((sum, cat) => sum + cat.limit, 0)
    const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0)
    
    return totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500 dark:bg-red-600'
    if (percentage >= 80) return 'bg-yellow-500 dark:bg-yellow-600'
    return 'bg-green-500 dark:bg-green-600'
  }

  const getCategoryById = (id: string) => {
    return categories.find(c => c.id === id) || { name: 'Unknown', color: '#888888', type: 'EXPENSE', id: '0' }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center flex-col sm:flex-row space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('navigation.budgetPlanning')}</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan and manage your budget</p>
        </div>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          {!isCreating && (
            <>
              <div className="flex items-center mr-2 text-sm text-gray-600 dark:text-gray-400">
                <FiCheck className="text-green-500 mr-1" />
                <span>Synced with transactions</span>
              </div>
              <button 
                onClick={refreshBudgetData}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm flex items-center w-full sm:w-auto justify-center"
                title="Update budget progress with latest transactions"
              >
                <FiRefreshCw className="mr-2" />
                Update Progress
              </button>
              <button 
                onClick={handleCreateBudget}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm flex items-center w-full sm:w-auto justify-center"
              >
                <FiPlus className="mr-2" />
                {t('budget.createBudget')}
              </button>
            </>
          )}
        </div>
      </div>
      
      {isCreating ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {isEditing ? t('budget.editBudget') : t('budget.createBudget')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('budget.budgetName')}
              </label>
              <input 
                type="text"
                value={newBudget.name}
                onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                className="input-field w-full"
                placeholder="e.g. Monthly Expenses"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="budget-period">
                {t('budget.period')}
              </label>
              <select 
                id="budget-period"
                value={newBudget.period}
                onChange={(e) => setNewBudget({
                  ...newBudget, 
                  period: e.target.value as Budget['period']
                })}
                className="input-field w-full"
                aria-label={t('budget.period')}
              >
                <option value="weekly">{t('budget.weekly')}</option>
                <option value="monthly">{t('budget.monthly')}</option>
                <option value="yearly">{t('budget.yearly')}</option>
                <option value="custom">{t('budget.custom')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="budget-start-date">
                {t('budget.startDate')}
              </label>
              <input 
                id="budget-start-date"
                type="date"
                value={newBudget.startDate}
                onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
                className="input-field w-full"
                aria-label={t('budget.startDate')}
              />
            </div>
            
            {newBudget.period === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="budget-end-date">
                  {t('budget.endDate')}
                </label>
                <input 
                  id="budget-end-date"
                  type="date"
                  value={newBudget.endDate}
                  onChange={(e) => setNewBudget({...newBudget, endDate: e.target.value})}
                  className="input-field w-full"
                  aria-label={t('budget.endDate')}
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4 flex-col sm:flex-row space-y-2 sm:space-y-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('budget.categories')}</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={applySuggestedLimits}
                  className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-md text-sm font-medium flex items-center"
                  title="Set limits based on past transactions"
                >
                  <FiRefreshCw className="mr-1.5" size={14} />
                  Auto Limits
                </button>
                <button 
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-md text-sm font-medium flex items-center"
                >
                  <FiPlus className="mr-1.5" size={14} />
                  {t('budget.addCategory')}
                </button>
              </div>
            </div>
            
            {newBudget.categories && newBudget.categories.length > 0 ? (
              <div className="space-y-4">
                {newBudget.categories.map((category, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1" htmlFor={`category-type-${index}`}>
                        {t('transactions.category')}
                      </label>
                      <select 
                        id={`category-type-${index}`}
                        value={category.categoryId}
                        onChange={(e) => handleCategoryChange(index, 'categoryId', e.target.value)}
                        className="input-field w-full"
                        aria-label={t('transactions.category')}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1" htmlFor={`category-limit-${index}`}>
                        {t('budget.limit')}
                      </label>
                      <input 
                        id={`category-limit-${index}`}
                        type="number"
                        value={category.limit}
                        onChange={(e) => handleCategoryChange(index, 'limit', e.target.value)}
                        className="input-field w-full"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        aria-label={t('budget.limit')}
                      />
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveCategory(index)}
                      className="p-1.5 mt-4 sm:mt-6 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Remove ${getCategoryById(category.categoryId).name} category`}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add categories to your budget and set spending limits
                </p>
                <button 
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm inline-flex items-center mx-auto"
                >
                  <FiPlus className="mr-2" />
                  Add Your First Category
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 flex-wrap sm:flex-nowrap">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full sm:w-auto mb-2 sm:mb-0"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveBudget}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md w-full sm:w-auto"
              disabled={!newBudget.name || !newBudget.categories?.length}
            >
              {isEditing ? t('budget.editBudget') : t('budget.saveBudget')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {budgets.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map(budget => {
                  const progress = calculateProgress(budget)
                  const progressColor = getProgressColor(progress)
                  
                  return (
                    <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4 sm:p-6 pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{budget.name}</h3>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleEditBudget(budget.id)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              aria-label={t('budget.editBudget')}
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              aria-label={t('budget.deleteBudget')}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center text-sm flex-wrap">
                            <span className="text-gray-600 dark:text-gray-400">{t('budget.spent')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(budget.categories.reduce((sum, cat) => sum + cat.spent, 0))}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm flex-wrap">
                            <span className="text-gray-600 dark:text-gray-400">{t('budget.limit')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(budget.categories.reduce((sum, cat) => sum + cat.limit, 0))}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm flex-wrap">
                            <span className="text-gray-600 dark:text-gray-400">{t('budget.period')}</span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                              {t(`budget.${budget.period}`)}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('budget.progress')}</span>
                            <span className={`font-medium ${progress > 100 ? 'text-red-600 dark:text-red-400 flex items-center' : 'text-gray-900 dark:text-white'}`}>
                              {progress > 100 ? (
                                <>
                                  <FiAlertCircle className="mr-1" />
                                  {Math.round(progress)}% (Over budget)
                                </>
                              ) : (
                                `${Math.round(progress)}%`
                              )}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${progressColor}`}
                              style={{ width: `${Math.min(100, progress)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('budget.categories')}</h4>
                        <div className="space-y-3">
                          {budget.categories.map(category => {
                            const cat = getCategoryById(category.categoryId)
                            const catProgress = category.limit > 0 ? (category.spent / category.limit) * 100 : 0
                            const catProgressColor = getProgressColor(catProgress)
                            
                            const isExpanded = expandedCategory && 
                                              expandedCategory.budgetId === budget.id && 
                                              expandedCategory.categoryId === category.categoryId
                            
                            return (
                              <div key={category.id} className="text-sm">
                                <div 
                                  className="flex justify-between items-center mb-1 flex-wrap"
                                  onClick={() => setExpandedCategory(isExpanded ? null : { budgetId: budget.id, categoryId: category.categoryId })}
                                >
                                  <div className="flex items-center cursor-pointer">
                                    <span 
                                      className="w-2 h-2 rounded-full mr-2"
                                      style={{ backgroundColor: cat.color }}
                                    ></span>
                                    <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                                  </div>
                                  <div className={`text-gray-700 dark:text-gray-300 mt-1 sm:mt-0 ${catProgress > 100 ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                    {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
                                    {catProgress > 100 && (
                                      <span className="ml-1 text-xs">
                                        <FiAlertCircle className="inline mr-0.5" />
                                        Over
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                                  <div 
                                    className={`h-1.5 rounded-full ${catProgressColor}`}
                                    style={{ width: `${Math.min(100, catProgress)}%` }}
                                  ></div>
                                </div>
                                
                                {isExpanded && (
                                  <div className="mt-2 mb-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Recent transactions</p>
                                    
                                    {(() => {
                                      const categoryTransactions = getTransactionsForCategory(budget.id, category.categoryId)
                                      
                                      if (categoryTransactions.length === 0) {
                                        return (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">No transactions in this period</p>
                                        )
                                      }
                                      
                                      return (
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                          {categoryTransactions.slice(0, 5).map(transaction => (
                                            <div key={transaction.id} className="flex justify-between text-xs">
                                              <div className="text-gray-600 dark:text-gray-400">
                                                <span className="mr-2">{new Date(transaction.date).toLocaleDateString()}</span>
                                                {transaction.title}
                                              </div>
                                              <div className="font-medium text-gray-700 dark:text-gray-300">
                                                {formatCurrency(transaction.amount)}
                                              </div>
                                            </div>
                                          ))}
                                          
                                          {categoryTransactions.length > 5 && (
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                              + {categoryTransactions.length - 5} more transactions
                                            </p>
                                          )}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('budget.noBudgets')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{t('budget.createYourFirst')}</p>
              <button 
                onClick={handleCreateBudget}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm inline-flex items-center"
              >
                <FiPlus className="mr-2" />
                {t('budget.createBudget')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 