"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, MessageCircle, Settings, ThumbsUp, LogOut } from "lucide-react"
import { getCurrentUser, signOut, supabase } from "@/lib/supabase"

export default function IntroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push("/auth")
      return
    }

    // Ensure user exists in our database (using email as primary key)
    try {
      const { error: upsertError } = await supabase
        .from("users")
        .upsert({
          email: user.email || "",
        }, {
          onConflict: 'email'
        })

      if (upsertError) {
        console.error("Error ensuring user exists:", upsertError)
      } else {
        console.log("User record ensured in database")
      }
    } catch (error) {
      console.error("Exception ensuring user exists:", error)
    }

    setIsLoading(false)
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-8">
        <div></div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Let&apos;s Create Your Personalized Experience</h1>
        <p className="text-xl text-muted-foreground">
          We&apos;ll customize the AI conversation to match your specific needs and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">1. Choose Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Tell us what you want to get out of this conversation - whether it&apos;s emotional support, advice, creative
              brainstorming, or just a friendly chat.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">2. Select Persona</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Choose how you want the AI to communicate with you - from neutral to opinionated, and from validating to
              critically challenging.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
              <ThumbsUp className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">3. Share Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              After your conversation, we&apos;ll ask a few quick questions about your experience to help us better cater to
              your preferences in the future.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Why do we collect this information?</h3>
              <p className="text-sm text-muted-foreground">
                Your feedback helps us understand what makes conversations most helpful and engaging. This data allows
                us to continuously improve our AI system to better serve users like you in future conversations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Link href="/chat/setup">
          <Button size="lg" className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
