"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { getCurrentUser } from "@/lib/supabase"

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const checkUser = useCallback(async () => {
    const user = await getCurrentUser()
    if (user) {
      router.push("/chat/intro")
    } else {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const handleAuthSuccess = () => {
    router.push("/chat/intro")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to AI Conversationalist</h1>
        <p className="text-muted-foreground">Sign in to get personalized AI conversations that improve over time</p>
      </div>
      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  )
}
