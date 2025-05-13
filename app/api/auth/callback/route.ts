import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import type { Database } from '@/lib/database.types'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirect_to') || '/'
  const response = NextResponse.redirect(redirectTo)
  const supabase = createRouteHandlerClient({ request, response })
  await supabase.auth.getSessionFromUrl({ storeSession: true })
  return response
}
