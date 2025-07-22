"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat-interface"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/supabase"

export default function ChatPage() {
  const router = useRouter()
  const [persona, setPersona] = useState<string | null>(null)
  const [purpose, setPurpose] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuthAndSetup = useCallback(async () => {
    // First check authentication
    const user = await getCurrentUser()
    if (!user) {
      router.push("/auth")
      return
    }

    // Then retrieve settings from localStorage
    const storedPersona = localStorage.getItem("chatPersona")
    const storedPurpose = localStorage.getItem("chatPurpose")

    if (!storedPersona || !storedPurpose) {
      // If settings are not found, redirect to setup
      router.push("/chat/setup")
      return
    }

    setPersona(storedPersona)
    setPurpose(storedPurpose)
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    checkAuthAndSetup()
  }, [checkAuthAndSetup])

  const handleEndChat = () => {
    router.push("/feedback")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-pulse">Loading conversation...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-medium">AI Conversation</h1>
          </div>
          <Button variant="outline" onClick={handleEndChat}>
            End & Give Feedback
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatInterface persona={persona!} purpose={purpose!} />
      </div>
    </div>
  )
}
