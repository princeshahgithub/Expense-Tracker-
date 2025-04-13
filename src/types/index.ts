export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
  userId: string;
  isRecurring: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate?: string;
  notes?: string;
  currency: string;
  category: {
    id: string;
    name: string;
    color: string | null;
    type: 'INCOME' | 'EXPENSE';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string | null;
  icon: string | null;
  userId: string;
}

export interface FormData {
  title: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  date: string;
  notes: string;
  isRecurring: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface FilterState {
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  category: string;
} 