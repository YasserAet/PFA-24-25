import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "uV3J9kL8x2+7Q9mN5zF1a8P0W4yT6vB9"

// Protected routes that require authentication
const protectedRoutes = [
  "/gallery",
  "/location", 
  "/map",
  "/projects",
  "/Floors",
  "/cyclorama",
  "/vr",
  "/panorama-tour"
]

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup"
]

// Simple JWT verification for Edge Runtime
function verifyToken(token: string): boolean {
  try {
    // Basic JWT structure validation
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]))
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) {
      console.log("Token expired:", payload.exp, "current:", currentTime)
      return false
    }
    
    // Check if token has required fields
    if (!payload.userId) {
      console.log("Token missing userId")
      return false
    }
    
    console.log("Token verified successfully, userId:", payload.userId)
    return true
  } catch (error) {
    console.log("Token verification error:", error)
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log("Middleware: Processing request for", pathname)
  
  // Skip middleware for API routes, static files, and other assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname.startsWith('/static/')
  ) {
    return NextResponse.next()
  }

  // Get token once
  const token = request.cookies.get("auth-token")?.value
  console.log("Middleware: Token from cookies:", !!token)
  console.log("Middleware: All cookies:", request.cookies.getAll().map(c => c.name))
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  console.log("Middleware: Route analysis:", {
    pathname,
    isProtectedRoute,
    isPublicRoute
  })

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    console.log("Middleware: Protected route, token exists:", !!token)

    if (!token) {
      console.log("Middleware: No token, redirecting to login")
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (!verifyToken(token)) {
      console.log("Middleware: Token invalid, redirecting to login")
      const loginUrl = new URL('/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("auth-token")
      return response
    }

    console.log("Middleware: Token valid, allowing access")
    return NextResponse.next()
  }

  // If user is authenticated and tries to access login/signup, redirect to home
  if (isPublicRoute && token) {
    console.log("Middleware: Public route with token, checking validity")
    
    if (verifyToken(token)) {
      console.log("Middleware: Token valid, redirecting to home")
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    } else {
      console.log("Middleware: Token invalid, clearing and allowing access")
      const response = NextResponse.next()
      response.cookies.delete("auth-token")
      return response
    }
  }

  // Allow access to unmatched routes
  console.log("Middleware: Unmatched route, allowing access")
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|static).*)',
  ],
}

// NOTE: No models are loaded in this middleware.
// This file only handles authentication and route access control.
// Model loading happens in API route handlers or service files, not here.