"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CaffeineChart } from "@/components/caffeine-chart"
import { ConsumptionLog } from "@/components/consumption-log"
import { CurrentCaffeineLevel } from "@/components/current-caffeine-level"
import { AddDrinkModal } from "@/components/add-drink-modal"
import { type CaffeineEntry, calculateCaffeineLevel } from "@/lib/caffeine-utils"
import { Plus } from "lucide-react"

const STORAGE_KEY = "caffeine-tracker-entries"
const BEDTIME_STORAGE_KEY = "caffeine-tracker-bedtime"
const DEFAULT_BEDTIME = "22:00"

function parseBedtimeString(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const bedtime = new Date()
  bedtime.setHours(hours, minutes, 0, 0)
  // If bedtime has passed today, set it for tomorrow
  if (bedtime.getTime() < Date.now()) {
    bedtime.setDate(bedtime.getDate() + 1)
  }
  return bedtime
}

export function CaffeineTracker() {
  const [entries, setEntries] = useState<CaffeineEntry[]>([])
  const [bedtimeStr, setBedtimeStr] = useState(DEFAULT_BEDTIME)
  const [isLoaded, setIsLoaded] = useState(false)
  const [addDrinkOpen, setAddDrinkOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const entriesWithDates = parsed.map((entry: CaffeineEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        setEntries(entriesWithDates)
      } catch (e) {
        console.error("Failed to parse stored entries", e)
      }
    }
    const storedBedtime = localStorage.getItem(BEDTIME_STORAGE_KEY)
    if (storedBedtime) {
      setBedtimeStr(storedBedtime)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    }
  }, [entries, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(BEDTIME_STORAGE_KEY, bedtimeStr)
    }
  }, [bedtimeStr, isLoaded])

  const bedtime = useMemo(() => parseBedtimeString(bedtimeStr), [bedtimeStr])

  const handleBedtimeChange = useCallback((time: string) => {
    setBedtimeStr(time)
  }, [])

  const addEntry = (drink: string, caffeineAmount: number, icon: string) => {
    const newEntry: CaffeineEntry = {
      id: crypto.randomUUID(),
      drink,
      caffeineAmount,
      timestamp: new Date(),
      icon,
    }
    setEntries((prev) => [...prev, newEntry])
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const updateEntryTime = (id: string, newTime: Date) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, timestamp: newTime } : entry)))
  }

  const currentLevel = useMemo(() => {
    return calculateCaffeineLevel(entries, new Date())
  }, [entries])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CurrentCaffeineLevel
        level={currentLevel}
        entries={entries}
        bedtime={bedtime}
        bedtimeStr={bedtimeStr}
        onBedtimeChange={handleBedtimeChange}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Caffeine Level Over Time</CardTitle>
          <Button
            onClick={() => setAddDrinkOpen(true)}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Drink
          </Button>
        </CardHeader>
        <CardContent>
          <CaffeineChart entries={entries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsumptionLog entries={entries} onRemove={removeEntry} onUpdateTime={updateEntryTime} />
        </CardContent>
      </Card>

      <AddDrinkModal
        open={addDrinkOpen}
        onOpenChange={setAddDrinkOpen}
        onAddDrink={addEntry}
      />
    </div>
  )
}
