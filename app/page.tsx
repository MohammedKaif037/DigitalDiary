import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import DiaryLayout from "@/components/diary-layout"
import { BookOpen } from "lucide-react"

export default async function Home() {
  try {
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
              <p className="mb-4">
                Please set up your Supabase environment variables in{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code>:
              </p>
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

    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    return <DiaryLayout />
  } catch (error) {
    console.error("Error in Home component:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black notebook p-4">
        <div className="w-full max-w-md p-8 notebook-cover rounded-lg">
          <div className="bg-white text-black rounded-md p-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Error</h1>
            <p>There was an error initializing the application. Please check your environment setup.</p>
          </div>
        </div>
      </div>
    )
  }
}
