import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirect_to') || '/'
  const response = NextResponse.redirect(redirectTo)
  
  const supabase = createRouteHandlerClient({ cookies })
  
  await supabase.auth.exchangeCodeForSession(url.searchParams.get('code') || '')
  return response
}
