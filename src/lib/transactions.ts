import { prisma } from './prisma';
import { Transaction, Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schema for transactions
export const TransactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(['INCOME', 'EXPENSE'], { 
    errorMap: () => ({ message: "Type must be either INCOME or EXPENSE" })
  }),
  date: z.string().transform(str => new Date(str)),
  categoryId: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  currency: z.string().default('INR'),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  nextDueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  userId: z.string()
});

export type TransactionInput = z.infer<typeof TransactionSchema>;

interface GetTransactionsOptions {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}

export async function deleteTransaction(id: string, userId: string): Promise<Transaction | null> {
  try {
    // First check if transaction exists and belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!transaction) {
      console.log(`Transaction ${id} not found or does not belong to user ${userId}`);
      return null;
    }

    const deletedTransaction = await prisma.transaction.delete({
      where: { id }
    });
    
    console.log(`Successfully deleted transaction ${id} for user ${userId}`);
    return deletedTransaction;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return null;
  }
}

export async function getTransactions(options: GetTransactionsOptions): Promise<Transaction[]> {
  try {
    console.log('Getting transactions with options:', options)
    const { userId, startDate, endDate, categoryId } = options;

    // Build where clause
    const where: any = { userId };
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    console.log('Prisma where clause:', where)
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        category: true // Include category details in the response
      }
    });

    console.log(`Retrieved ${transactions.length} transactions for user ${userId}`);
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error; // Re-throw to handle in the API route
  }
}

export async function saveTransaction(data: TransactionInput): Promise<Transaction | null> {
  try {
    console.log('Starting transaction save with data:', {
      ...data,
      userId: '[REDACTED]'
    });

    // Ensure userId is present
    if (!data.userId) {
      throw new Error('User ID is required');
    }

    // Validate input data
    console.log('Validating transaction data...');
    const validatedData = TransactionSchema.parse(data);
    console.log('Data validation successful');

    // Check if category exists and belongs to user
    console.log(`Checking if category ${validatedData.categoryId} exists for user ${validatedData.userId}`);
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: validatedData.userId
      }
    });

    if (!category) {
      throw new Error(`Category ${validatedData.categoryId} not found for user ${validatedData.userId}`);
    }

    console.log('Category found:', category.name);

    // Create transaction data object
    const transactionData: Prisma.TransactionCreateInput = {
      title: validatedData.title,
      amount: validatedData.amount,
      type: validatedData.type,
      date: validatedData.date,
      notes: validatedData.notes,
      currency: validatedData.currency,
      isRecurring: validatedData.isRecurring,
      frequency: validatedData.frequency,
      nextDueDate: validatedData.nextDueDate,
      category: {
        connect: { id: validatedData.categoryId }
      },
      user: {
        connect: { id: validatedData.userId }
      }
    };

    console.log('Creating transaction with data:', {
      ...transactionData,
      user: '[REDACTED]'
    });

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: transactionData,
      include: {
        category: true
      }
    });

    console.log('Transaction created successfully:', {
      id: transaction.id,
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type
    });

    return transaction;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      throw new Error(`Database error: ${error.message}`);
    }
    if (error instanceof z.ZodError) {
      console.error('Validation error:', JSON.stringify(error.errors, null, 2));
      throw error;
    }
    console.error('Unknown error:', error);
    throw error;
  }
}

export async function getTransactionById(id: string, userId: string): Promise<Transaction | null> {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      },
      include: {
        category: true
      }
    });

    if (!transaction) {
      console.log(`Transaction ${id} not found for user ${userId}`);
      return null;
    }

    return transaction;
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    return null;
  }
} 