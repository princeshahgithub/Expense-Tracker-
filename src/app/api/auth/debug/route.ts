import { NextResponse } from 'next/server'
import { authOptions } from '../[...nextauth]/options'

export async function GET() {
  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development mode' }, { status: 403 })
  }

  // Get auth providers info (strip sensitive data)
  const providers = authOptions.providers.map(provider => ({
    id: provider.id,
    name: provider.name,
    type: provider.type
  }))

  // Get auth callbacks info (just the names)
  const callbacks = Object.keys(authOptions.callbacks || {})

  return NextResponse.json({
    providers,
    callbacks,
    session: {
      strategy: authOptions.session?.strategy
    },
    pages: authOptions.pages,
    adapter: authOptions.adapter ? 'Configured' : 'None',
    debug: authOptions.debug
  })
} 