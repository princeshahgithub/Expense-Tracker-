import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
  type: z.enum(['INCOME', 'EXPENSE'], { 
    errorMap: () => ({ message: "Type must be either INCOME or EXPENSE" })
  }),
  icon: z.string().optional(),
})

// Default categories for new users
const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#F87171', type: 'EXPENSE', icon: 'FiShoppingCart' },
  { name: 'Transportation', color: '#60A5FA', type: 'EXPENSE', icon: 'FiTruck' },
  { name: 'Entertainment', color: '#818CF8', type: 'EXPENSE', icon: 'FiFilm' },
  { name: 'Shopping', color: '#F472B6', type: 'EXPENSE', icon: 'FiShoppingBag' },
  { name: 'Home', color: '#A78BFA', type: 'EXPENSE', icon: 'FiHome' },
  { name: 'Salary', color: '#34D399', type: 'INCOME', icon: 'FiDollarSign' },
  { name: 'Freelance', color: '#A3E635', type: 'INCOME', icon: 'FiGlobe' },
  { name: 'Investment', color: '#FBBF24', type: 'INCOME', icon: 'FiTrendingUp' },
];

// Helper function to ensure categories exist for the user
async function ensureDefaultCategories(userId: string) {
  // Check if the user already has categories
  const existingCategories = await prisma.category.count({
    where: { userId }
  });

  // If the user already has categories, return
  if (existingCategories > 0) {
    return;
  }

  // Create default categories for this user
  console.log(`Creating default categories for user ${userId}`);
  await Promise.all(
    DEFAULT_CATEGORIES.map(category => 
      prisma.category.create({
        data: {
          name: category.name,
          color: category.color,
          type: category.type,
          icon: category.icon,
          userId
        }
      })
    )
  );

  console.log(`Created ${DEFAULT_CATEGORIES.length} default categories for user ${userId}`);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      console.error('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Ensure default categories exist
    await ensureDefaultCategories(user.id);

    // Get all categories for this user
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error in GET /api/categories:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      console.error('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const json = await request.json()
    
    try {
      const data = CategorySchema.parse(json)
      
      // Check if a category with the same name already exists for this user
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: data.name,
          userId: user.id
        }
      });

      if (existingCategory) {
        return NextResponse.json({ 
          error: 'Category already exists',
          message: `A category with the name "${data.name}" already exists`
        }, { status: 400 });
      }
      
      // Create the category
      const newCategory = await prisma.category.create({
        data: {
          name: data.name,
          color: data.color,
          type: data.type,
          icon: data.icon,
          userId: user.id
        }
      });
      
      return NextResponse.json(newCategory)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
        return NextResponse.json({ 
          error: 'Validation Error', 
          details: errorDetails 
        }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error('Error in POST /api/categories:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user from database
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
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 })
    }

    // Check if the category exists and belongs to the user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: user.id
      }
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Check if there are any transactions using this category
    const transactionsCount = await prisma.transaction.count({
      where: {
        categoryId: id,
        userId: user.id
      }
    });
    
    if (transactionsCount > 0) {
      return NextResponse.json({ 
        error: 'Category in use',
        message: `This category is used by ${transactionsCount} transactions and cannot be deleted`
      }, { status: 400 })
    }
    
    // Delete the category
    await prisma.category.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/categories:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 
