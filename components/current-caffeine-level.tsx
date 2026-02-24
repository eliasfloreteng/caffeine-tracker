"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Moon } from "lucide-react"
import {
  type CaffeineEntry,
  calculateCaffeineLevel,
  calculateTimeUntilThreshold,
  CAFFEINE_HALF_LIFE_HOURS,
} from "@/lib/caffeine-utils"

interface CurrentCaffeineLevelProps {
  level: number
  entries: CaffeineEntry[]
  bedtime: Date
  bedtimeStr: string
  onBedtimeChange: (time: string) => void
}

const SLEEP_THRESHOLD = 30 // mg - threshold for "below X mg" display

const BEDTIME_HOURS = [21, 22, 23, 0, 1] // 21:00 through 01:00

export function CurrentCaffeineLevel({ level, entries, bedtime, bedtimeStr, onBedtimeChange }: CurrentCaffeineLevelProps) {
  const thresholdTime = calculateTimeUntilThreshold(entries, SLEEP_THRESHOLD)

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
      return `Already below ${SLEEP_THRESHOLD}mg`
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
      return `Below ${SLEEP_THRESHOLD}mg in ${minutesUntil}min`
    } else if (hoursUntil < 24) {
      const hours = Math.floor(hoursUntil)
      const minutes = Math.round((hoursUntil - hours) * 60)
      return `Below ${SLEEP_THRESHOLD}mg at ${actualTime} (${hours}h ${minutes}m)`
    } else {
      return `Below ${SLEEP_THRESHOLD}mg at ${actualTime} tomorrow`
    }
  }

  // Calculate caffeine levels at different bedtimes
  const bedtimeLevels = useMemo(() => {
    const now = new Date()
    return BEDTIME_HOURS.map((hour) => {
      const time = new Date()
      time.setHours(hour, 0, 0, 0)
      // If the time has already passed today, set to tomorrow
      if (time.getTime() <= now.getTime()) {
        time.setDate(time.getDate() + 1)
      }
      const caffeineAtTime = calculateCaffeineLevel(entries, time)
      return {
        hour,
        label: `${String(hour).padStart(2, "0")}:00`,
        level: Math.round(caffeineAtTime),
        isBelowThreshold: caffeineAtTime < SLEEP_THRESHOLD,
      }
    })
  }, [entries])

  const maxBedtimeLevel = useMemo(() => {
    return Math.max(...bedtimeLevels.map((b) => b.level), SLEEP_THRESHOLD)
  }, [bedtimeLevels])

  return (
    <Card className="bg-card border-2">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-stretch gap-6">
          {/* Left side: current level */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`rounded-full bg-primary/10 p-3 shrink-0 ${getStatusColor()}`}>
              <Activity className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Current Caffeine Level</p>
              <p className={`text-4xl font-bold ${getStatusColor()}`}>
                {Math.round(level)}
                <span className="text-lg font-normal text-muted-foreground">mg</span>
              </p>
              <p className={`text-sm font-medium mt-1 ${getStatusColor()}`}>{getStatusText()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatThresholdTime()}</p>
              <p className="text-xs text-muted-foreground">Half-life: ~{CAFFEINE_HALF_LIFE_HOURS}h</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-border" />
          <div className="md:hidden h-px bg-border" />

          {/* Right side: bedtime caffeine levels */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Moon className="h-4 w-4" />
                Caffeine at bedtime
              </div>
              <input
                type="time"
                value={bedtimeStr}
                onChange={(e) => onBedtimeChange(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-0.5 text-xs w-[90px]"
              />
            </div>
            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Add drinks to see bedtime projections
              </p>
            ) : (
              <div className="space-y-1.5">
                {bedtimeLevels.map((bt) => {
                  const barWidth = maxBedtimeLevel > 0 ? (bt.level / maxBedtimeLevel) * 100 : 0
                  return (
                    <div key={bt.label} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-muted-foreground font-mono shrink-0">{bt.label}</span>
                      <div className="flex-1 h-4 bg-muted/30 rounded-sm overflow-hidden relative">
                        <div
                          className={`h-full rounded-sm transition-all ${
                            bt.isBelowThreshold ? "bg-secondary/60" : "bg-chart-4/60"
                          }`}
                          style={{ width: `${Math.max(barWidth, bt.level > 0 ? 2 : 0)}%` }}
                        />
                        {/* Threshold marker */}
                        {maxBedtimeLevel > SLEEP_THRESHOLD && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-muted-foreground/40"
                            style={{ left: `${(SLEEP_THRESHOLD / maxBedtimeLevel) * 100}%` }}
                          />
                        )}
                      </div>
                      <span className={`w-12 text-right font-medium shrink-0 ${
                        bt.isBelowThreshold ? "text-secondary" : "text-chart-4"
                      }`}>
                        {bt.level}mg
                      </span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {SLEEP_THRESHOLD}mg threshold
                  </span>
                  <span className="text-xs font-medium">
                    {thresholdTime ? (
                      <span className="text-secondary">
                        Safe after {thresholdTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    ) : (
                      <span className="text-secondary">Already below {SLEEP_THRESHOLD}mg</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
