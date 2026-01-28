"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Coffee, AlertTriangle, CheckCircle } from "lucide-react"
import {
  type CaffeineEntry,
  calculateCaffeineAtBedtime,
  calculateMaxAdditionalCaffeine,
  calculateMaxDoseForBedtime,
  DEFAULT_BEDTIME_THRESHOLD,
} from "@/lib/caffeine-utils"

interface BedtimeInsightsProps {
  entries: CaffeineEntry[]
  bedtime: Date
  onBedtimeChange: (time: string) => void
}

export function BedtimeInsights({ entries, bedtime, onBedtimeChange }: BedtimeInsightsProps) {
  const insights = useMemo(() => {
    const now = new Date()
    const hoursUntilBed = (bedtime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const projectedAtBed = calculateCaffeineAtBedtime(entries, bedtime)
    const maxAdditional = calculateMaxAdditionalCaffeine(entries, bedtime)
    const maxDoseNow = calculateMaxDoseForBedtime(hoursUntilBed)
    const isOnTrack = projectedAtBed <= DEFAULT_BEDTIME_THRESHOLD

    return {
      hoursUntilBed,
      projectedAtBed,
      maxAdditional,
      maxDoseNow,
      isOnTrack,
      isPastBedtime: hoursUntilBed <= 0,
    }
  }, [entries, bedtime])

  const formatBedtimeForInput = (date: Date) => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  const formatHoursUntil = (hours: number) => {
    if (hours <= 0) return "Past bedtime"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (h === 0) return `${m}min`
    return `${h}h ${m}m`
  }

  return (
    <Card className="bg-card border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Moon className="h-5 w-5" />
          Bedtime Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bedtime Setting */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Your bedtime</span>
          <input
            type="time"
            value={formatBedtimeForInput(bedtime)}
            onChange={(e) => onBedtimeChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
        </div>

        {/* Time until bed */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Time until bed</span>
          <span className="text-sm font-medium">
            {formatHoursUntil(insights.hoursUntilBed)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Status indicator */}
        {!insights.isPastBedtime && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 ${
              insights.isOnTrack
                ? "bg-secondary/20 text-secondary"
                : "bg-destructive/20 text-destructive"
            }`}
          >
            {insights.isOnTrack ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {insights.isOnTrack
                  ? "On track for good sleep"
                  : "May affect sleep quality"}
              </p>
              <p className="text-xs opacity-80">
                Projected {Math.round(insights.projectedAtBed)}mg at bedtime
                {insights.isOnTrack
                  ? ` (target: <${DEFAULT_BEDTIME_THRESHOLD}mg)`
                  : ` (${Math.round(insights.projectedAtBed - DEFAULT_BEDTIME_THRESHOLD)}mg over target)`}
              </p>
            </div>
          </div>
        )}

        {/* Max additional caffeine */}
        {!insights.isPastBedtime && insights.maxAdditional > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-accent/10 p-3">
            <Coffee className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">
                You can have up to{" "}
                <span className="text-accent">{Math.round(insights.maxAdditional)}mg</span> more
              </p>
              <p className="text-xs text-muted-foreground">
                To stay under {DEFAULT_BEDTIME_THRESHOLD}mg at bedtime
              </p>
            </div>
          </div>
        )}

        {/* Quick reference */}
        {!insights.isPastBedtime && insights.hoursUntilBed >= 4 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Max single dose now
            </p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(insights.maxDoseNow)}
              <span className="text-sm font-normal text-muted-foreground">mg</span>
            </p>
            <p className="text-xs text-muted-foreground">
              A fresh {Math.round(insights.maxDoseNow)}mg dose now reaches {DEFAULT_BEDTIME_THRESHOLD}mg by bedtime
            </p>
          </div>
        )}

        {insights.isPastBedtime && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Bedtime has passed for today
          </p>
        )}
      </CardContent>
    </Card>
  )
}
