"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [envError, setEnvError] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check for environment variables
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvError(true)
    }
  }, [])

  // Create Supabase client with explicit options
  const supabase = (() => {
    try {
      if (envError) return null

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setEnvError(true)
        return null
      }

      return createClientComponentClient({
        supabaseUrl,
        supabaseKey,
      })
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      setInitError(error instanceof Error ? error.message : "Unknown error initializing Supabase")
      return null
    }
  })()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (envError || initError) {
      toast({
        title: "Configuration Error",
        description: initError || "Supabase environment variables are missing",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (envError || initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black notebook">
        <div className="w-full max-w-md p-8 notebook-cover rounded-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-black p-3 rounded-full">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Environment Setup Required</CardTitle>
              <CardDescription className="text-center">
                {initError ? "Error initializing Supabase" : "Please set up your Supabase environment variables"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {initError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    <p className="font-medium">Error:</p>
                    <p className="text-sm">{initError}</p>
                  </div>
                ) : (
                  <>
                    <p>Add the following to your Netlify environment variables:</p>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                      <code>
                        NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{"\n"}
                        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                      </code>
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      After adding environment variables, redeploy your application.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black notebook">
      <div className="w-full max-w-md p-8 notebook-cover rounded-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-black p-3 rounded-full">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Digital Diary</CardTitle>
            <CardDescription className="text-center">Sign in to access your diary</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
