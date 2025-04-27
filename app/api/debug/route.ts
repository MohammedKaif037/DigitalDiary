import { NextResponse } from "next/server"

export async function GET() {
  // This endpoint helps debug environment variables in production
  // IMPORTANT: Remove this in production after debugging!

  return NextResponse.json({
    supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
  })
}
