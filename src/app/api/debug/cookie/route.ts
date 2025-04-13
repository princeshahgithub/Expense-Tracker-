import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  // Get session safely
  let session = null;
  let sessionError = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    sessionError = String(error);
  }
  
  return NextResponse.json({
    cookies: allCookies.map(cookie => ({
      name: cookie.name,
      value: cookie.name.includes('session') ? '[REDACTED]' : cookie.value,
    })),
    session: session ? {
      user: session.user,
      expires: session.expires,
    } : null,
    sessionError,
    hasSessionCookie: Boolean(cookieStore.get('next-auth.session-token'))
  });
} 