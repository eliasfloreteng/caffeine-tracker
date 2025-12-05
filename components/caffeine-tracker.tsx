"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DrinkSelector } from "@/components/drink-selector"
import { CaffeineChart } from "@/components/caffeine-chart"
import { ConsumptionLog } from "@/components/consumption-log"
import { CurrentCaffeineLevel } from "@/components/current-caffeine-level"
import { type CaffeineEntry, calculateCaffeineLevel } from "@/lib/caffeine-utils"

const STORAGE_KEY = "caffeine-tracker-entries"

export function CaffeineTracker() {
  const [entries, setEntries] = useState<CaffeineEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

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
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    }
  }, [entries, isLoaded])

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
      <CurrentCaffeineLevel level={currentLevel} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Drink</CardTitle>
          </CardHeader>
          <CardContent>
            <DrinkSelector onAddDrink={addEntry} />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Caffeine Level Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <CaffeineChart entries={entries} />
        </CardContent>
      </Card>
    </div>
  )
}
