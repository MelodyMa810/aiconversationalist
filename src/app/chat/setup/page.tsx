"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonaSelector } from "@/components/persona-selector"
import { PurposeSelector } from "@/components/purpose-selector"
import { getCurrentUser } from "@/lib/supabase"

export default function SetupPage() {
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] = useState("")
  const [selectedPurpose, setSelectedPurpose] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push("/auth")
      return
    }
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Check if both parts of the persona are selected
  const isPersonaComplete = () => {
    if (!selectedPersona) return false

    // If it contains a hyphen, it means both tone and approach are selected
    if (selectedPersona.includes("-")) return true

    // Otherwise, check if it's just one of the options
    return false
  }

  const handleStartChat = () => {
    if (isPersonaComplete() && selectedPurpose) {
      // Store selections in localStorage for simplicity in the MVP
      localStorage.setItem("chatPersona", selectedPersona)
      localStorage.setItem("chatPurpose", selectedPurpose)
      router.push("/chat")
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set Up Your Conversation</CardTitle>
          <CardDescription>Choose how you want the AI to interact with you during this conversation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">What&apos;s the purpose of this conversation?</h3>
            <PurposeSelector selectedPurpose={selectedPurpose} onSelectPurpose={setSelectedPurpose} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Select your preferred AI Persona</h3>
            <PersonaSelector selectedPersona={selectedPersona} onSelectPersona={setSelectedPersona} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartChat} disabled={!isPersonaComplete() || !selectedPurpose} className="w-full">
            Start Conversation
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
