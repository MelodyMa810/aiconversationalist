import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="container mx-auto max-w-2xl py-16 px-4 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>

      <h1 className="text-3xl font-bold mb-4">Thank You for Your Feedback!</h1>

      <div className="space-y-4 mt-8">
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            Return to Home
          </Button>
        </Link>

        <Link href="/chat/setup">
          <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
            Start a New Conversation
          </Button>
        </Link>
      </div>
    </div>
  )
}
