import { NextResponse } from 'next/server'

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

export async function GET() {
  // Return a count of items in each collection
  const counts = {
    transactions: STORAGE.transactions.length,
    categories: STORAGE.categories.length,
    budgets: STORAGE.budgets.length,
  };
  
  // Return sample data (first item if available) for each collection
  const samples = {
    transaction: STORAGE.transactions.length > 0 ? STORAGE.transactions[0] : null,
    category: STORAGE.categories.length > 0 ? STORAGE.categories[0] : null,
    budget: STORAGE.budgets.length > 0 ? STORAGE.budgets[0] : null,
  };
  
  return NextResponse.json({
    counts,
    samples,
  });
} 