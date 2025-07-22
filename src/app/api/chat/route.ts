import { HfInference } from '@huggingface/inference'
import { getSystemPrompt } from "@/lib/ai"

interface Message {
  role: string;
  content: string;
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const hf = new HfInference(process.env.HUGGING_FACE_HUB_TOKEN)

export async function POST(req: Request) {
  try {
    const { messages, persona, purpose } = await req.json()

    console.log("Chat API called with:", { persona, purpose, messageCount: messages.length })

    // Get the appropriate system prompt based on persona and purpose
    const systemPrompt = getSystemPrompt(persona, purpose)

    // Convert messages to the format expected by the chat completion API
    const conversationMessages = (messages as Message[])
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role,
        content: m.content
      }))

    // Add system message at the beginning
    const messagesWithSystem = [
      { role: "system", content: systemPrompt },
      ...conversationMessages
    ]

    console.log("Calling Hugging Face chat completion API...")

    try {
      // Use the chat completion API
      const response = await hf.chatCompletion({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: messagesWithSystem,
        max_tokens: 1024,
        temperature: 0.7,
      })

      console.log("Hugging Face API response received:", response)

      // Extract the message content from the response
      const messageContent = response.choices?.[0]?.message?.content || "No response generated"

      // Return the response as a simple JSON
      return new Response(
        JSON.stringify({
          message: messageContent.trim(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    } catch (streamError) {
      console.error("Error calling Hugging Face API:", streamError)
      console.error("Stream error details:", streamError instanceof Error ? streamError.message : "Unknown stream error")
      
      // Return a fallback response
      return new Response(
        JSON.stringify({
          error: "Failed to get response from Hugging Face API.",
          details: streamError instanceof Error ? streamError.message : "Unknown stream error",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    console.error("Error details:", error instanceof Error ? error.message : "Unknown error")
    return new Response(
      JSON.stringify({
        error: "Failed to get AI response. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
