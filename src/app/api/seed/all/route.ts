import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { v4 as uuidv4 } from 'uuid'

// Reference to the same global storage used in other files
const STORAGE: {
  budgets: any[];
  categories: any[];
  transactions: any[];
} = (global as any).STORAGE || {
  budgets: [],
  categories: [],
  transactions: []
};

// Make storage available globally to share between API routes
if (!(global as any).STORAGE) {
  (global as any).STORAGE = STORAGE;
}

// Default categories for testing
const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#F87171', type: 'EXPENSE', icon: 'FiShoppingCart' },
  { name: 'Transportation', color: '#60A5FA', type: 'EXPENSE', icon: 'FiTruck' },
  { name: 'Entertainment', color: '#818CF8', type: 'EXPENSE', icon: 'FiFilm' },
  { name: 'Shopping', color: '#F472B6', type: 'EXPENSE', icon: 'FiShoppingBag' },
  { name: 'Home', color: '#A78BFA', type: 'EXPENSE', icon: 'FiHome' },
  { name: 'Utilities', color: '#34D399', type: 'EXPENSE', icon: 'FiHome' },
  { name: 'Groceries', color: '#10B981', type: 'EXPENSE', icon: 'FiShoppingCart' },
  { name: 'Salary', color: '#34D399', type: 'INCOME', icon: 'FiDollarSign' },
  { name: 'Freelance', color: '#A3E635', type: 'INCOME', icon: 'FiGlobe' },
  { name: 'Investment', color: '#FBBF24', type: 'INCOME', icon: 'FiTrendingUp' },
];

// Generate a random date within the provided range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    if (!userId) {
      console.error('User ID not found in session');
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    // 1. Create categories
    console.log('Creating sample categories...');
    const now = new Date().toISOString();
    const categories = DEFAULT_CATEGORIES.map(category => ({
      id: uuidv4(),
      userId,
      name: category.name,
      color: category.color,
      type: category.type as 'INCOME' | 'EXPENSE',
      icon: category.icon,
      createdAt: now,
      updatedAt: now
    }));
    
    // Replace any existing categories for this user
    STORAGE.categories = [
      ...STORAGE.categories.filter((cat: any) => cat.userId !== userId),
      ...categories
    ];
    
    // 2. Create budgets for the current month
    console.log('Creating sample budgets...');
    
    // Get expense categories only
    const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE');
    
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const budgets = expenseCategories.map(category => {
      // Random budget between $100 and $1000
      const amount = Math.floor(Math.random() * 900) + 100;
      
      return {
        id: uuidv4(),
        userId,
        name: `${category.name} Budget`,
        amount,
        categoryId: category.id,
        period: 'MONTHLY',
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        notes: `Sample budget for ${category.name}`,
        applyToAllMonths: false,
        createdAt: now,
        updatedAt: now
      };
    });
    
    // Replace any existing budgets for this user
    STORAGE.budgets = [
      ...STORAGE.budgets.filter((budget: any) => budget.userId !== userId),
      ...budgets
    ];
    
    // 3. Create transactions for each category
    console.log('Creating sample transactions...');
    
    let transactions = [];
    
    // Generate 3-10 transactions per category
    for (const category of categories) {
      const transactionCount = Math.floor(Math.random() * 7) + 3;
      
      for (let i = 0; i < transactionCount; i++) {
        // Generate different amounts based on transaction type
        let amount;
        if (category.type === 'EXPENSE') {
          // Expenses between $5 and $100
          amount = Math.floor(Math.random() * 95) + 5;
        } else {
          // Income between $500 and $3000
          amount = Math.floor(Math.random() * 2500) + 500;
        }
        
        transactions.push({
          id: uuidv4(),
          userId,
          title: `${category.name} ${i + 1}`,
          amount,
          type: category.type,
          date: randomDate(startOfMonth, endOfMonth).toISOString(),
          categoryId: category.id,
          notes: `Sample ${category.type.toLowerCase()} for ${category.name}`,
          currency: 'USD',
          isRecurring: false,
          createdAt: now,
          updatedAt: now
        });
      }
    }
    
    // Replace any existing transactions for this user
    STORAGE.transactions = [
      ...STORAGE.transactions.filter((tx: any) => tx.userId !== userId),
      ...transactions
    ];
    
    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      counts: {
        categories: categories.length,
        budgets: budgets.length,
        transactions: transactions.length
      }
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({
      error: 'Failed to seed data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 