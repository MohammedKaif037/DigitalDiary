import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import DiaryLayout from "@/components/diary-layout";

export default async function Home() {
  try {
    // Check if environment variables exist
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return (
        <div>
          <h1>Environment Variables Missing</h1>
          <p>Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
        </div>
      );
    }

    // Create Supabase client correctly
    const supabase = createServerComponentClient({ cookies });

    // Fetch session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      redirect("/login");
    }

    // If session exists, show diary layout
    return <DiaryLayout />;
  } catch (error: any) {
    // Display the real error on screen for debugging
    return (
      <div style={{ padding: 20 }}>
        <h1 style={{ color: "red" }}>Error initializing application</h1>
        <pre style={{ backgroundColor: "#eee", padding: 10 }}>
          {JSON.stringify(error, null, 2)}
        </pre>
        <p style={{ marginTop: 20 }}>
          Check if Supabase keys, project settings, and database are correct.
        </p>
      </div>
    );
  }
}
