"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"
import {
  type CaffeineEntry,
  calculateTimeUntilThreshold,
  CAFFEINE_HALF_LIFE_HOURS,
  DEFAULT_BEDTIME_THRESHOLD,
} from "@/lib/caffeine-utils"

interface CurrentCaffeineLevelProps {
  level: number
  entries: CaffeineEntry[]
}

export function CurrentCaffeineLevel({ level, entries }: CurrentCaffeineLevelProps) {
  const THRESHOLD = DEFAULT_BEDTIME_THRESHOLD // 50mg conservative target
  const thresholdTime = calculateTimeUntilThreshold(entries, THRESHOLD)

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

  const formatThresholdTime = () => {
    if (!thresholdTime) {
      return `Already below ${THRESHOLD}mg`
    }

    const now = new Date()
    const msUntil = thresholdTime.getTime() - now.getTime()
    const hoursUntil = msUntil / (1000 * 60 * 60)
    const actualTime = thresholdTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })

    if (hoursUntil < 1) {
      const minutesUntil = Math.round(msUntil / (1000 * 60))
      return `Below ${THRESHOLD}mg in ${minutesUntil}min (at ${actualTime})`
    } else if (hoursUntil < 24) {
      const hours = Math.floor(hoursUntil)
      const minutes = Math.round((hoursUntil - hours) * 60)
      return `Below ${THRESHOLD}mg in ${hours}h ${minutes}m (at ${actualTime})`
    } else {
      return `Below ${THRESHOLD}mg at ${actualTime} tomorrow`
    }
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
          <p className="text-xs text-muted-foreground mt-1">{formatThresholdTime()}</p>
          <p className="text-xs text-muted-foreground">Half-life: ~{CAFFEINE_HALF_LIFE_HOURS} hours</p>
        </div>
      </CardContent>
    </Card>
  )
}
