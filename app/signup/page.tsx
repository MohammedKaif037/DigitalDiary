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

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [envError, setEnvError] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check for environment variables
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvError(true)
    }
  }, [])

  // Only create the Supabase client if environment variables exist
  const supabase = !envError ? createClientComponentClient() : null

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (envError) {
      toast({
        title: "Configuration Error",
        description: "Supabase environment variables are missing",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (envError) {
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
                Please set up your Supabase environment variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Add the following to your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                  <code>
                    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{"\n"}
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                  </code>
                </pre>
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
            <CardTitle className="text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">Sign up to start your digital diary</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
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
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
