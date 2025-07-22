import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Types for our database
export interface User {
  id: string
  created_at: string
  email: string
}

export interface Conversation {
  id: string
  user_id: string
  persona: string
  purpose: string
  messages: Record<string, unknown>[]
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  conversation_id: string
  persona_match: string
  communication_style: string
  feedback_approach: string
  answer_length: string
  comments: string
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  preferred_persona?: string
  preferred_purpose?: string
  preferred_answer_length?: string
  persona_match_avg?: number
  communication_style_avg?: number
  feedback_approach_avg?: number
  total_conversations: number
  updated_at: string
}