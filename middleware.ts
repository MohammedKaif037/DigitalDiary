import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check if environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Allow access to all routes even without environment variables
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is signed in and the current path is /login or /signup, redirect to /
    if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // Continue to the requested page in case of error
  }

  return res
}

export const config = {
  matcher: ["/", "/login", "/signup"],
}
