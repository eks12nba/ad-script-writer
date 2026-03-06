import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextFetchEvent } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

const clerk = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Completely bypass Clerk for file upload routes to prevent body consumption
  if (request.nextUrl.pathname.startsWith('/api/admin/upload-scripts')) {
    return NextResponse.next()
  }
  return clerk(request, event)
}

export const config = { matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'] }
