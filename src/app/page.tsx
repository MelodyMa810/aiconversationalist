import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">AI Conversationalist</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold tracking-tight">Hey there, what do you want to chat about today?</h2>
          <p className="text-xl text-muted-foreground">
            Choose the purpose of your conversation and the persona you&apos;d like to chat with
          </p>

          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Personalized Experience</h3>
              <p>Select the AI persona and conversation purpose that best fits your needs.</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Help Improve AI</h3>
              <p>Your feedback will help us better cater to your needs for your future conversations.</p>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                Start a Conversation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

