import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { TransactionSchema } from '@/lib/transactions'
import { getTransactions, saveTransaction, deleteTransaction } from '@/lib/transactions'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Schema for query parameters
const QuerySchema = z.object({
  startDate: z.string().optional().transform(date => date ? new Date(date) : undefined),
  endDate: z.string().optional().transform(date => date ? new Date(date) : undefined),
  categoryId: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('Unauthorized: No user session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user from the database to get their ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.error('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryResult = QuerySchema.safeParse(Object.fromEntries(searchParams))
    
    if (!queryResult.success) {
      console.log('Invalid query parameters:', queryResult.error)
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error },
        { status: 400 }
      )
    }

    console.log(`Fetching transactions for user: ${user.id}`)
    const transactions = await getTransactions({
      userId: user.id,
      ...queryResult.data
    })

    console.log(`Retrieved ${transactions.length} transactions`)
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error in GET /api/transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/transactions - Starting transaction creation')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('Unauthorized: No user session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user from the database
    console.log(`Looking up user with email: ${session.user.email}`)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.error('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`User found: ${user.id}`)

    // Get request body
    const body = await request.json()
    console.log('Transaction data received:', {
      ...body,
      userId: '[REDACTED]'
    })

    // Check if there's at least one category for this user
    const categoryCount = await prisma.category.count({
      where: { userId: user.id }
    })

    if (categoryCount === 0) {
      console.error('No categories found for user')
      return NextResponse.json(
        { error: 'No categories found. Please create a category first.' },
        { status: 400 }
      )
    }

    // Verify the category exists
    if (body.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: body.categoryId,
          userId: user.id
        }
      })

      if (!category) {
        console.error(`Category ${body.categoryId} not found for user ${user.id}`)
        return NextResponse.json(
          { error: 'Invalid category. Please select a valid category.' },
          { status: 400 }
        )
      }
      
      console.log(`Category verified: ${category.name}`)
    }

    // Create transaction directly with Prisma
    try {
      console.log('Creating transaction...')
      
      // Parse and validate the input data
      const amount = typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount
      
      const transactionData = {
        title: body.title,
        amount,
        type: body.type,
        date: new Date(body.date),
        categoryId: body.categoryId,
        notes: body.notes || null,
        currency: body.currency || 'INR',
        isRecurring: !!body.isRecurring,
        frequency: body.isRecurring ? body.frequency : null,
        nextDueDate: body.nextDueDate ? new Date(body.nextDueDate) : null,
        userId: user.id
      }

      console.log('Prepared transaction data:', {
        ...transactionData,
        userId: '[REDACTED]'
      })

      // Create the transaction using Prisma directly
      const transaction = await prisma.transaction.create({
        data: transactionData,
        include: {
          category: true
        }
      })

      console.log(`Transaction created successfully: ${transaction.id}`)
      return NextResponse.json(transaction, { status: 201 })
    } catch (error) {
      console.error('Error creating transaction:', error)
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const errorDetails = {
          code: error.code,
          message: error.message,
          meta: error.meta
        }
        
        console.error('Prisma error details:', errorDetails)
        
        return NextResponse.json(
          { 
            error: 'Database error', 
            details: errorDetails 
          },
          { status: 500 }
        )
      }
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation error', 
            details: error.errors 
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Unknown error', 
          message: error instanceof Error ? error.message : 'Something went wrong'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/transactions:', error)
    return NextResponse.json(
      { 
        error: 'Server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user from the database to get their ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.error('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const result = await deleteTransaction(id, user.id)
    if (!result) {
      return NextResponse.json(
        { error: 'Transaction not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/transactions:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
} 