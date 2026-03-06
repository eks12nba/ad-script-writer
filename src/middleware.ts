import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
const isUploadRoute = createRouteMatcher(['/api/admin/upload-scripts'])
export default clerkMiddleware(async (auth, request) => {
  if (isUploadRoute(request)) return
  if (!isPublicRoute(request)) await auth.protect()
})
export const config = { matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'] }
