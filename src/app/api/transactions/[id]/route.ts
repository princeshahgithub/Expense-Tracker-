import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { TransactionSchema } from '@/lib/transactions'
import { Prisma } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const transactionId = params.id
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    // Get transaction with category
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id
      },
      include: {
        category: true
      }
    })
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error in GET /api/transactions/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const transactionId = params.id
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    // Verify transaction exists and belongs to this user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id
      }
    })
    
    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const body = await request.json()
    
    try {
      // Validate the update data
      const data = TransactionSchema.parse({
        ...body,
        userId: user.id
      })
      
      // Check if the category exists and belongs to the user
      const categoryExists = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          userId: user.id
        }
      })
      
      if (!categoryExists) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
      
      // Update the transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          title: data.title,
          amount: data.amount,
          type: data.type,
          date: data.date,
          categoryId: data.categoryId,
          notes: data.notes,
          currency: data.currency,
          isRecurring: data.isRecurring,
          frequency: data.frequency,
          nextDueDate: data.nextDueDate,
          updatedAt: new Date()
        },
        include: {
          category: true
        }
      })

      return NextResponse.json(updatedTransaction)
    } catch (error) {
      console.error('Error updating transaction:', error)
      
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
        
        return NextResponse.json(
          { error: 'Validation Error', details: errorDetails },
          { status: 400 }
        )
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: 'Database Error', message: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in PUT /api/transactions/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      console.error('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const transactionId = params.id
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    console.log(`Attempting to delete transaction ${transactionId} for user ${user.id}`)

    // First verify the transaction exists and belongs to this user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    console.log(`Successfully deleted transaction ${transactionId}`)
    return NextResponse.json({ success: true, message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Database error', message: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
} 