"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface CurrentCaffeineLevelProps {
  level: number
}

export function CurrentCaffeineLevel({ level }: CurrentCaffeineLevelProps) {
  const getStatusColor = () => {
    if (level < 25) return "text-secondary"
    if (level < 75) return "text-accent"
    if (level < 150) return "text-chart-4"
    return "text-destructive"
  }

  const getStatusText = () => {
    if (level < 25) return "Low - Perfect for sleep"
    if (level < 75) return "Moderate - Nicely alert"
    if (level < 150) return "High - Feeling energized"
    return "Very High - Maybe slow down?"
  }

  return (
    <Card className="bg-card border-2">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-full bg-primary/10 p-3 ${getStatusColor()}`}>
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Caffeine Level</p>
            <p className={`text-4xl font-bold ${getStatusColor()}`}>
              {Math.round(level)}
              <span className="text-lg font-normal text-muted-foreground">mg</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-medium ${getStatusColor()}`}>{getStatusText()}</p>
          <p className="text-xs text-muted-foreground">Half-life: ~5 hours</p>
        </div>
      </CardContent>
    </Card>
  )
}
