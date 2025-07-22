"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { getCurrentUser, supabase } from "@/lib/supabase"

interface FeedbackData {
  personaMatch: string;
  communicationStyle: string;
  feedbackApproach: string;
  answerLength: string;
  persona: string;
  purpose: string;
}

export default function FeedbackPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [personaMatch, setPersonaMatch] = useState<string>("")
  const [communicationStyle, setCommunicationStyle] = useState<string>("")
  const [feedbackApproach, setFeedbackApproach] = useState<string>("")
  const [answerLength, setAnswerLength] = useState<string>("")
  const [comments, setComments] = useState("")

  const checkAuth = useCallback(async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push("/auth")
      return
    }
    
    // Debug: Check user details
    console.log("Current user:", {
      id: user.id,
      email: user.email,
      aud: user.aud,
      role: user.role
    })
    
    // Debug: Test a simple database query
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      
      console.log("User query result:", { data, error })
    } catch (err) {
      console.log("User query error:", err)
    }
    
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current user
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth")
        return
      }

      console.log("Starting feedback submission for user:", user.id)

      // Debug: Test user creation capability
      console.log("Testing user creation capability...")
      try {
        const { data: testUser, error: testError } = await supabase
          .from("users")
          .upsert({
            email: user.email || "",
          }, {
            onConflict: 'email'
          })
          .select("email")
          .single()
        
        console.log("User creation test result:", { testUser, testError })
        
        if (testError) {
          console.error("❌ User creation test failed:", {
            error: testError,
            message: testError.message,
            details: testError.details,
            hint: testError.hint,
            code: testError.code
          })
        } else {
          console.log("✅ User creation test successful")
        }
      } catch (testErr) {
        console.error("❌ Exception in user creation test:", testErr)
      }

      // Debug: Verify Supabase authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log("Supabase session check:", { 
        session: !!session, 
        sessionError,
        userEmail: session?.user?.email 
      })

      // Debug: Test if we can query users table
      const { data, error: userCheckError } = await supabase
        .from("users")
        .select("email")
        .eq("email", user.email || "")
        .single()
      
      let userCheck = data

      console.log("User table check:", { userCheck, userCheckError, userEmail: user.email })

      if (userCheckError || !userCheck) {
        console.log("User not found in database, attempting to create user record...")
        
        // Try to create the user record using email as primary key
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .upsert({
            email: user.email || "",
          }, {
            onConflict: 'email'
          })
          .select("email")
          .single()

        if (createUserError) {
          console.error("Failed to create user record:", {
            error: createUserError,
            message: createUserError.message,
            details: createUserError.details,
            hint: createUserError.hint,
            code: createUserError.code
          })
          
          // Try a fallback approach - query again in case the user was created by another process
          console.log("Trying fallback user lookup...")
          const { data: fallbackUser, error: fallbackError } = await supabase
            .from("users")
            .select("email")
            .eq("email", user.email || "")
            .single()
          
          if (fallbackError || !fallbackUser) {
            throw new Error("Failed to create or find user record in database")
          }
          
          console.log("User found in fallback lookup:", fallbackUser)
          userCheck = fallbackUser
        } else {
          console.log("User record created successfully:", newUser)
          userCheck = newUser
        }
      }

      // Debug: Test user_preferences table structure
      console.log("Testing user_preferences table structure...")
      try {
        const { data: testPrefs, error: testError } = await supabase
          .from("user_preferences")
          .select("user_email, preferred_persona, preferred_purpose, total_conversations")
          .limit(1)
        
        console.log("User preferences table test:", { testPrefs, testError })
        
        if (testError) {
          console.error("❌ User preferences table test failed:", {
            error: testError,
            message: testError.message,
            details: testError.details,
            hint: testError.hint,
            code: testError.code
          })
        }
      } catch (testErr) {
        console.error("❌ Exception testing user_preferences table:", testErr)
      }

      // Get chat history from localStorage
      const chatHistory = localStorage.getItem("chatHistory")
      const persona = localStorage.getItem("chatPersona")
      const purpose = localStorage.getItem("chatPurpose")

      console.log("LocalStorage data:", { chatHistory: !!chatHistory, persona, purpose })

      // Parse chat history
      const messages = JSON.parse(chatHistory || "[]")
      console.log("Parsed messages:", messages.length, "messages")

      // Store conversation using user_email from database
      console.log("Attempting to insert conversation with data:", {
        user_email: userCheck.email,
        persona: persona || "",
        purpose: purpose || "",
        messagesCount: messages.length
      })
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_email: userCheck.email,
          persona: persona || "",
          purpose: purpose || "",
          messages: messages,
        })
        .select()
        .single()

      if (convError) {
        console.error("Conversation insertion error:", {
          error: convError,
          message: convError.message,
          details: convError.details,
          hint: convError.hint,
          code: convError.code
        })
        throw convError
      }

      console.log("Conversation created successfully:", conversation.conversation_id)

      // Store feedback
      console.log("Attempting to insert feedback...")
      const { error: feedbackError } = await supabase
        .from("feedback")
        .insert({
          conversation_id: conversation.conversation_id,
          user_email: userCheck.email,
          persona_match: personaMatch,
          communication_style: communicationStyle,
          feedback_approach: feedbackApproach,
          answer_length: answerLength,
          comments: comments,
        })

      if (feedbackError) {
        console.error("Feedback insertion error:", {
          error: feedbackError,
          message: feedbackError.message,
          details: feedbackError.details,
          hint: feedbackError.hint,
          code: feedbackError.code
        })
        throw feedbackError
      }

      console.log("Feedback created successfully")

      // Update user preferences
      console.log("Attempting to update user preferences...")
      try {
        await updateUserPreferencesClient(userCheck.email, {
          personaMatch,
          communicationStyle,
          feedbackApproach,
          answerLength,
          persona: persona || "",
          purpose: purpose || "",
        })
      } catch (prefError) {
        console.error("User preferences update failed:", {
          error: prefError,
          message: prefError instanceof Error ? prefError.message : String(prefError),
          details: (prefError as { details?: string })?.details,
          hint: (prefError as { hint?: string })?.hint,
          code: (prefError as { code?: string })?.code,
          stack: prefError instanceof Error ? prefError.stack : undefined
        })
        // Don't throw - feedback submission should still succeed even if preferences fail
      }

      // Clear localStorage
      localStorage.removeItem("chatHistory")
      localStorage.removeItem("chatPersona")
      localStorage.removeItem("chatPurpose")

      console.log("✅ Feedback submission completed successfully")

      // Redirect to thank you page
      router.push("/thank-you")
    } catch (error) {
      console.error("Error submitting feedback:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        details: (error as { details?: string })?.details,
        hint: (error as { hint?: string })?.hint,
        code: (error as { code?: string })?.code,
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        constructor: error instanceof Error ? error.constructor?.name : undefined
      })
      setIsSubmitting(false)
    }
  }

  // Update user preferences using client-side Supabase
  const updateUserPreferencesClient = async (userEmail: string, feedback: FeedbackData) => {
    try {
      console.log("🔍 Starting user preferences update for userEmail:", userEmail)
      console.log("Feedback data:", feedback)
      
      // Check if user already has preferences for this exact persona/purpose combination
      const { data: existingPrefs, error: selectError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_email", userEmail)
        .eq("preferred_persona", feedback.persona)
        .eq("preferred_purpose", feedback.purpose)
        .single()

      console.log("Existing preferences query result:", { existingPrefs, selectError })

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        console.error("❌ Error querying existing preferences:", {
          error: selectError,
          message: selectError.message,
          details: selectError.details,
          hint: selectError.hint,
          code: selectError.code
        })
        throw selectError
      }

      if (existingPrefs) {
        // Update existing row - increment total_conversations for this specific combination
        console.log("📝 Updating existing preferences (same persona/purpose)...")
        const newPrefs = {
          total_conversations: existingPrefs.total_conversations + 1,
          updated_at: new Date().toISOString(),
        }

        console.log("Updated preferences data:", newPrefs)

        const { error: updateError } = await supabase
          .from("user_preferences")
          .update(newPrefs)
          .eq("user_email", userEmail)
          .eq("preferred_persona", feedback.persona)
          .eq("preferred_purpose", feedback.purpose)

        if (updateError) {
          console.error("❌ Error updating preferences:", {
            error: updateError,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          })
          throw updateError
        } else {
          console.log("✅ Preferences updated successfully (incremented total)")
        }
      } else {
        // Create new row for this persona/purpose combination
        console.log("➕ Creating new preferences row (different persona/purpose)...")
        const newPrefs = {
          user_email: userEmail,
          preferred_persona: feedback.persona,
          preferred_purpose: feedback.purpose,
          total_conversations: 1,
          updated_at: new Date().toISOString(),
        }

        console.log("New preferences data:", newPrefs)

        const { error: insertError } = await supabase
          .from("user_preferences")
          .insert(newPrefs)

        if (insertError) {
          console.error("❌ Error inserting new preferences:", {
            error: insertError,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          })
          throw insertError
        } else {
          console.log("✅ New preferences row created successfully")
        }
      }

      console.log("User preferences update completed")
    } catch (error) {
      console.error("Error updating user preferences:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        details: (error as { details?: string })?.details,
        hint: (error as { hint?: string })?.hint,
        code: (error as { code?: string })?.code,
        name: error instanceof Error ? error.name : undefined,
        constructor: error instanceof Error ? error.constructor?.name : undefined
      })
      // Re-throw the error so it can be caught by the calling function
      throw error
    }
  }

  const isFormValid = personaMatch && communicationStyle && feedbackApproach && answerLength && comments.trim()

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">How was your conversation?</CardTitle>
          <CardDescription>Help us help you—your feedback fuels better conversations ahead!</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>1. Did the persona match what you were seeking?</Label>
              <RadioGroup value={personaMatch} onValueChange={setPersonaMatch} className="flex flex-col space-y-1">
                {["perfectly", "mostly", "somewhat", "barely", "not-at-all"].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`persona-${value}`} />
                    <Label htmlFor={`persona-${value}`}>
                      {value === "perfectly"
                        ? "Perfectly matched"
                        : value === "mostly"
                          ? "Mostly matched"
                          : value === "somewhat"
                            ? "Somewhat matched"
                            : value === "barely"
                              ? "Barely matched"
                              : "Not at all"}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>2. Did the communication style match?</Label>
              <RadioGroup
                value={communicationStyle}
                onValueChange={setCommunicationStyle}
                className="flex flex-col space-y-1"
              >
                {["perfectly", "mostly", "somewhat", "barely", "not-at-all"].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`style-${value}`} />
                    <Label htmlFor={`style-${value}`}>
                      {value === "perfectly"
                        ? "Perfectly matched"
                        : value === "mostly"
                          ? "Mostly matched"
                          : value === "somewhat"
                            ? "Somewhat matched"
                            : value === "barely"
                              ? "Barely matched"
                              : "Not at all"}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>3. Did feedback approach match?</Label>
              <RadioGroup
                value={feedbackApproach}
                onValueChange={setFeedbackApproach}
                className="flex flex-col space-y-1"
              >
                {["perfectly", "mostly", "somewhat", "barely", "not-at-all"].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`approach-${value}`} />
                    <Label htmlFor={`approach-${value}`}>
                      {value === "perfectly"
                        ? "Perfectly matched"
                        : value === "mostly"
                          ? "Mostly matched"
                          : value === "somewhat"
                            ? "Somewhat matched"
                            : value === "barely"
                              ? "Barely matched"
                              : "Not at all"}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>4. How were you finding the length of the answers?</Label>
              <RadioGroup value={answerLength} onValueChange={setAnswerLength} className="flex flex-col space-y-1">
                {["too-long", "slightly-long", "just-right", "slightly-short", "too-short"].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`length-${value}`} />
                    <Label htmlFor={`length-${value}`}>
                      {value === "too-long"
                        ? "Too long"
                        : value === "slightly-long"
                          ? "Slightly too long"
                          : value === "just-right"
                            ? "Just right"
                            : value === "slightly-short"
                              ? "Slightly too short"
                              : "Too short"}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="comments">5. Additional comments *</Label>
              <Textarea
                id="comments"
                placeholder="Please share your thoughts about the conversation. What worked well? What could be improved? This feedback is required."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={5}
                required
              />
              {!comments.trim() && <p className="text-sm text-muted-foreground">* This field is required</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}