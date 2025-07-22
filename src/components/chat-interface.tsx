"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { SendIcon, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  persona: string
  purpose: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatInterface({ persona, purpose }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "assistant-1",
      role: "assistant",
      content: getWelcomeMessage(persona, purpose),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Custom submit handler
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === "" || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          persona,
          purpose,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || "Sorry, I couldn't generate a response.",
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save to localStorage
      localStorage.setItem("chatHistory", JSON.stringify([...messages, userMessage, assistantMessage]))
    } catch (error) {
      console.error("Chat error:", error)
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("flex gap-3 max-w-[80%]", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <Avatar className="h-8 w-8">
                {message.role === "user" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-sm font-medium">
                    AI
                  </div>
                )}
              </Avatar>
              <Card className={cn("p-3", message.role === "user" ? "bg-primary text-primary-foreground" : "")}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </Card>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (input.trim() !== "") {
                  // Find the form and submit it directly
                  const form = e.currentTarget.closest('form')
                  if (form) {
                    form.requestSubmit()
                  }
                }
              }
            }}
          />
          <Button type="submit" disabled={isLoading || input.trim() === ""} className="self-end">
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

function getWelcomeMessage(persona: string, purpose: string): string {
  // Parse the combined persona value
  const [tone, approach] = persona.includes("-") ? persona.split("-") : [persona, ""]

  const welcomeMessages = {
    "neutral-validating": {
      emotional: "Hello, I&apos;m here to listen and provide support. Feel free to share what&apos;s on your mind.",
      advice: "Hello, I&apos;m here to offer balanced guidance. What would you like advice on?",
      process: "Hello, I&apos;m here to help you work through your thoughts. What would you like to explore?",
      creative: "Hello, I&apos;m ready to help you brainstorm. What creative challenge are you working on?",
      learning: "Hello, I&apos;m here to help you learn. What topic interests you today?",
      companionship: "Hello! I&apos;m here for a friendly chat. What&apos;s on your mind today?",
    },
    "neutral-critical": {
      emotional: "Hello, I&apos;m here to listen and help you examine your feelings objectively. What&apos;s going on?",
      advice: "Hello, I&apos;m here to provide practical, straightforward advice. What situation are you facing?",
      process: "Hello, I&apos;m here to help you analyze your thoughts carefully. What would you like to examine?",
      creative: "Hello, I&apos;m ready to help you brainstorm and refine ideas. What are you working on?",
      learning: "Hello, I&apos;m here to help you learn through questions and analysis. What topic interests you?",
      companionship: "Hello! I&apos;m here for an engaging conversation. What would you like to discuss?",
    },
    "opinionated-validating": {
      emotional:
        "Hi there! I&apos;m here to support you and I won&apos;t hesitate to share my perspective. What&apos;s bothering you?",
      advice: "Hello! I&apos;m ready to give you my honest take while being supportive. What do you need advice on?",
      process:
        "Hi! I&apos;m here to help you process your thoughts with clear perspectives and validation. What&apos;s on your mind?",
      creative:
        "Hello! I&apos;m excited to brainstorm with you and share bold ideas. What creative project are you working on?",
      learning:
        "Hello! I&apos;m here to share knowledge and perspectives enthusiastically. What would you like to learn about?",
      companionship: "Hi! I&apos;m ready for a lively conversation with plenty of opinions. What shall we chat about?",
    },
    "opinionated-critical": {
      emotional:
        "Hi there! I&apos;m here to listen and I&apos;ll give you my honest thoughts on your situation. What&apos;s going on?",
      advice: "Hello! I&apos;m ready to give you straightforward, no-nonsense advice. What situation are you dealing with?",
      process:
        "Hi! I&apos;m here to help you think through things with clear opinions and tough questions. What&apos;s on your mind?",
      creative: "Hello! I&apos;m ready to brainstorm boldly and challenge conventional thinking. What are you creating?",
      learning: "Hello! I&apos;m here to teach with strong perspectives and critical analysis. What topic interests you?",
      companionship: "Hi! I&apos;m ready for an engaging debate and lively discussion. What would you like to talk about?",
    },
  }

  // Create the combined key
  const combinedPersona = `${tone}-${approach}`

  // Get the welcome message, with fallback
  const personaMessages = welcomeMessages[combinedPersona as keyof typeof welcomeMessages]
  if (personaMessages) {
    return personaMessages[purpose as keyof typeof personaMessages] || "Hello, how can I help you today?"
  }

  // Fallback message if persona combination is not found
  return "Hello, how can I help you today?"
}
