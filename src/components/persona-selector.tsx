"use client"

import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const tonePersonas = [
  {
    id: "neutral",
    name: "Neutral",
    description: "Balanced and objective in responses",
  },
  {
    id: "opinionated",
    name: "Opinionated",
    description: "Offers clear viewpoints and perspectives",
  },
]

const approachPersonas = [
  {
    id: "validating",
    name: "Validating",
    description: "Focuses on emotional support and validation",
  },
  {
    id: "critical",
    name: "Critical",
    description: "Challenges your ideas critically",
  },
]

interface PersonaSelectorProps {
  selectedPersona: string
  onSelectPersona: (persona: string) => void
}

export function PersonaSelector({ selectedPersona, onSelectPersona }: PersonaSelectorProps) {
  // Parse the combined persona value (if it exists)
  const [selectedTone, selectedApproach] = selectedPersona?.split("-") || ["", ""]

  // Handle individual selections
  const handleToneSelect = (tone: string) => {
    const newPersona = `${tone}-${selectedApproach}`
    onSelectPersona(selectedApproach ? newPersona : tone)
  }

  const handleApproachSelect = (approach: string) => {
    const newPersona = `${selectedTone}-${approach}`
    onSelectPersona(selectedTone ? newPersona : approach)
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Select communication style:</h4>
        <RadioGroup
          value={selectedTone}
          onValueChange={handleToneSelect}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {tonePersonas.map((persona) => (
            <div key={persona.id} className="flex items-start space-x-2">
              <RadioGroupItem value={persona.id} id={`persona-${persona.id}`} className="mt-1" />
              <Label htmlFor={`persona-${persona.id}`} className="flex-1 cursor-pointer">
                <Card className={`transition-all h-full ${selectedTone === persona.id ? "border-primary" : ""}`}>
                  <CardContent className="p-4 h-full flex flex-col justify-center items-center min-h-[120px] space-y-2">
                    <div className="font-medium text-center">{persona.name}</div>
                    <div className="text-sm text-muted-foreground text-center">{persona.description}</div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Select feedback approach:</h4>
        <RadioGroup
          value={selectedApproach}
          onValueChange={handleApproachSelect}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {approachPersonas.map((persona) => (
            <div key={persona.id} className="flex items-start space-x-2">
              <RadioGroupItem value={persona.id} id={`persona-${persona.id}`} className="mt-1" />
              <Label htmlFor={`persona-${persona.id}`} className="flex-1 cursor-pointer">
                <Card className={`transition-all h-full ${selectedApproach === persona.id ? "border-primary" : ""}`}>
                  <CardContent className="p-4 h-full flex flex-col justify-center items-center min-h-[120px] space-y-2">
                    <div className="font-medium text-center">{persona.name}</div>
                    <div className="text-sm text-muted-foreground text-center">{persona.description}</div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
