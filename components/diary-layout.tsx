"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, LogOut, Plus } from "lucide-react"
import DiaryEntry from "@/components/diary-entry"
import DiaryEditor from "@/components/diary-editor"
import { useToast } from "@/components/ui/use-toast"

export default function DiaryLayout() {
  const [date, setDate] = useState<Date>(new Date())
  const [entry, setEntry] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [datesWithEntries, setDatesWithEntries] = useState<Date[]>([])
  const [envError, setEnvError] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Create Supabase client with explicit options
  const supabase = (() => {
    try {
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

  // Check for environment variables and fetch data
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvError(true)
      setIsLoading(false)
      toast({
        title: "Configuration Error",
        description: "Supabase environment variables are missing",
        variant: "destructive",
      })
      return
    }

    if (initError) {
      setIsLoading(false)
      toast({
        title: "Initialization Error",
        description: initError,
        variant: "destructive",
      })
      return
    }

    fetchEntryForDate(date)
    fetchDatesWithEntries()
  }, [date, initError])

  const fetchDatesWithEntries = async () => {
    if (envError || initError || !supabase) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase.from("diary_entries").select("date").eq("user_id", user.id)

      if (error) throw error

      const dates = data.map((item) => new Date(item.date))
      setDatesWithEntries(dates)
    } catch (error) {
      console.error("Error fetching dates with entries:", error)
    }
  }

  const fetchEntryForDate = async (date: Date) => {
    if (envError || initError || !supabase) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const formattedDate = format(date, "yyyy-MM-dd")

      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", formattedDate)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      setEntry(data || null)
    } catch (error) {
      console.error("Error fetching entry:", error)
      toast({
        title: "Error",
        description: "Failed to load diary entry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (envError || initError || !supabase) {
      router.push("/login")
      return
    }

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleNewEntry = () => {
    setIsEditing(true)
  }

  const handleSaveEntry = async (content: string) => {
    if (envError || initError || !supabase) {
      toast({
        title: "Configuration Error",
        description: initError || "Supabase environment variables are missing",
        variant: "destructive",
      })
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const formattedDate = format(date, "yyyy-MM-dd")

      if (entry) {
        // Update existing entry
        const { error } = await supabase.from("diary_entries").update({ content }).eq("id", entry.id)

        if (error) throw error
      } else {
        // Create new entry
        const { error } = await supabase.from("diary_entries").insert([
          {
            user_id: user.id,
            date: formattedDate,
            content,
          },
        ])

        if (error) throw error
      }

      setIsEditing(false)
      fetchEntryForDate(date)
      fetchDatesWithEntries()

      toast({
        title: "Success",
        description: "Diary entry saved",
      })
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "Error",
        description: "Failed to save diary entry",
        variant: "destructive",
      })
    }
  }

  if (envError || initError) {
    return (
      <div className="min-h-screen flex flex-col bg-black notebook">
        <header className="border-b bg-black diary-spine">
          <div className="container flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-white">My Digital Diary</h1>
            <Button variant="ghost" size="icon" onClick={() => router.push("/login")}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 container py-6">
          <div className="max-w-4xl mx-auto">
            <div className="notebook-cover p-6 rounded-lg">
              <div className="notebook-page bg-white text-black rounded-md p-8 min-h-[600px] relative">
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {initError ? "Initialization Error" : "Environment Setup Required"}
                  </h2>
                  <div className="bg-gray-100 p-6 rounded-lg max-w-lg">
                    {initError ? (
                      <>
                        <p className="mb-4 font-medium text-red-600">Error initializing Supabase client:</p>
                        <pre className="bg-gray-200 p-4 rounded-md overflow-x-auto mb-4 text-sm">{initError}</pre>
                      </>
                    ) : (
                      <>
                        <p className="mb-4">Please set up your Supabase environment variables in Netlify:</p>
                        <pre className="bg-gray-200 p-4 rounded-md overflow-x-auto mb-4 text-sm">
                          <code>
                            NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{"\n"}
                            NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                          </code>
                        </pre>
                        <p className="text-sm text-gray-600">
                          You can find these values in your Supabase project settings under{" "}
                          <span className="font-semibold">Project Settings &gt; API</span>.
                        </p>
                      </>
                    )}
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> After adding environment variables in Netlify, you need to trigger a new
                        deployment.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="page-curl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black notebook">
      <header className="border-b bg-black diary-spine">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-white">My Digital Diary</h1>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  modifiers={{ hasEntry: datesWithEntries }}
                  modifiersStyles={{
                    hasEntry: {
                      fontWeight: "bold",
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      color: "#dc2626",
                    },
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="max-w-4xl mx-auto">
          <div className="notebook-cover p-6 rounded-lg">
            <div className="notebook-page bg-white text-black rounded-md p-8 min-h-[600px] relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse">Loading...</div>
                </div>
              ) : isEditing ? (
                <DiaryEditor
                  initialContent={entry?.content || ""}
                  onSave={handleSaveEntry}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">{format(date, "EEEE, MMMM d, yyyy")}</h2>
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      {entry ? "Edit Entry" : "Write Entry"}
                    </Button>
                  </div>

                  {entry ? (
                    <DiaryEntry content={entry.content} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                      <p className="mb-4">No entry for this date</p>
                      <Button onClick={handleNewEntry} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Entry
                      </Button>
                    </div>
                  )}
                </>
              )}
              <div className="page-curl"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
