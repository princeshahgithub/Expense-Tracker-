import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test simple query
    const usersCount = await prisma.user.count()
    const categoriesCount = await prisma.category.count()
    const transactionsCount = await prisma.transaction.count()

    return NextResponse.json({
      success: true,
      database: 'connected',
      counts: {
        users: usersCount,
        categories: categoriesCount,
        transactions: transactionsCount
      }
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorObject: error
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a test category
    const testCategory = await prisma.category.create({
      data: {
        name: `Test Category ${Date.now()}`,
        type: 'EXPENSE',
        color: '#ff0000',
        userId: user.id
      }
    })

    // Create a test transaction
    const testTransaction = await prisma.transaction.create({
      data: {
        title: `Test Transaction ${Date.now()}`,
        amount: 10.99,
        type: 'EXPENSE',
        date: new Date(),
        currency: 'INR',
        isRecurring: false,
        category: {
          connect: { id: testCategory.id }
        },
        user: {
          connect: { id: user.id }
        }
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      category: testCategory,
      transaction: testTransaction
    })
  } catch (error) {
    console.error('Test transaction creation failed:', error)
    let errorMessage = 'Unknown error'
    let errorDetails = {}
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Extract more details if it's a Prisma error
      if ('code' in error) {
        errorDetails = {
          code: (error as any).code,
          meta: (error as any).meta
        }
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
} 