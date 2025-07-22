"use client"

import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const purposes = [
  {
    id: "emotional",
    name: "Emotional Support",
    description: "I need a space to share what I&apos;m feeling and feel heard.",
  },
  {
    id: "advice",
    name: "Seeking Advice",
    description: "I am looking for thoughtful, constructive advice on a problem I&apos;m facing.",
  },
  {
    id: "process",
    name: "Process My Thoughts",
    description: "I want help sorting through thoughts or emotions that feel tangled.",
  },
  {
    id: "creative",
    name: "Brainstorm Creatively",
    description: "I need help coming up with new, original, and out-of-the-box ideas.",
  },
  {
    id: "learning",
    name: "Learn Something New",
    description: "I&apos;m curious about something and want to explore or understand it better.",
  },
  {
    id: "companionship",
    name: "Just Chat",
    description: "I just want to talk - no agenda, just a friendly back-and-forth.",
  },
]

interface PurposeSelectorProps {
  selectedPurpose: string
  onSelectPurpose: (purpose: string) => void
}

export function PurposeSelector({ selectedPurpose, onSelectPurpose }: PurposeSelectorProps) {
  return (
    <RadioGroup
      value={selectedPurpose}
      onValueChange={onSelectPurpose}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {purposes.map((purpose) => (
        <div key={purpose.id} className="flex items-start space-x-2">
          <RadioGroupItem value={purpose.id} id={`purpose-${purpose.id}`} className="mt-1" />
          <Label htmlFor={`purpose-${purpose.id}`} className="flex-1 cursor-pointer">
            <Card className={`transition-all h-full ${selectedPurpose === purpose.id ? "border-primary" : ""}`}>
              <CardContent className="p-4 h-full flex flex-col justify-center items-center min-h-[120px] space-y-2">
                <div className="font-medium text-center">{purpose.name}</div>
                <div className="text-sm text-muted-foreground text-center">{purpose.description}</div>
              </CardContent>
            </Card>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
