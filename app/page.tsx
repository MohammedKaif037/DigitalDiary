import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import DiaryLayout from "@/components/diary-layout"
import { BookOpen } from "lucide-react"

export default async function Home() {
  try {
    // Log environment variable presence (not values) for debugging
    console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // Check if environment variables exist
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black notebook p-4">
          <div className="w-full max-w-md p-8 notebook-cover rounded-lg">
            <div className="flex justify-center mb-6">
              <div className="bg-black p-3 rounded-full">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="bg-white text-black rounded-md p-8">
              <h1 className="text-2xl font-bold mb-4 text-center">Environment Setup Required</h1>
              <p className="mb-4">Please set up your Supabase environment variables in Netlify:</p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4">
                <code>
                  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{"\n"}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                </code>
              </pre>
              <p>
                You can find these values in your Supabase project settings under{" "}
                <span className="font-semibold">Project Settings &gt; API</span>.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Create Supabase client with explicit options
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const supabase = createServerComponentClient({
      cookies,
      supabaseUrl,
      supabaseKey,
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    return <DiaryLayout />
  } catch (error) {
    console.error("Error in Home component:", error)

    // More detailed error message
    return (
      <div className="min-h-screen flex items-center justify-center bg-black notebook p-4">
        <div className="w-full max-w-md p-8 notebook-cover rounded-lg">
          <div className="bg-white text-black rounded-md p-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Error</h1>
            <p className="mb-4">There was an error initializing the application.</p>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="font-medium">Troubleshooting steps:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Verify your Supabase URL and anon key are correct</li>
                <li>Check that environment variables are properly set in Netlify</li>
                <li>Make sure to rebuild and redeploy after setting environment variables</li>
                <li>Ensure your Supabase project is active and running</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
