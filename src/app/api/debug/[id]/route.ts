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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Find transaction by ID regardless of user
  const transaction = STORAGE.transactions.find(t => t.id === id);
  
  if (!transaction) {
    return NextResponse.json({ 
      error: 'Transaction not found',
      queried_id: id,
      available_ids: STORAGE.transactions.map(t => t.id)
    }, { status: 404 });
  }
  
  // Find the category
  const category = STORAGE.categories.find(c => c.id === transaction.categoryId);
  
  return NextResponse.json({
    transaction,
    with_category: {
      ...transaction,
      category
    }
  });
} 