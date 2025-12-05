"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock } from "lucide-react"
import type { CaffeineEntry } from "@/lib/caffeine-utils"

interface ConsumptionLogProps {
  entries: CaffeineEntry[]
  onRemove: (id: string) => void
  onUpdateTime: (id: string, newTime: Date) => void
}

export function ConsumptionLog({ entries, onRemove, onUpdateTime }: ConsumptionLogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (entries.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-muted-foreground">
        <p>No drinks logged yet. Add your first drink!</p>
      </div>
    )
  }

  const sortedEntries = [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const handleTimeChange = (entry: CaffeineEntry, timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const newDate = new Date(entry.timestamp)
    newDate.setHours(hours, minutes)
    onUpdateTime(entry.id, newDate)
  }

  const formatTimeForInput = (date: Date) => {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
  }

  return (
    <div className="h-[280px] overflow-y-auto pr-2">
      <div className="space-y-2">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{entry.icon}</span>
              <div>
                <p className="font-medium">{entry.drink}</p>
                {editingId === entry.id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="time"
                      defaultValue={formatTimeForInput(entry.timestamp)}
                      className="h-7 w-28 text-xs"
                      onChange={(e) => handleTimeChange(entry, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                    />
                    <span className="text-xs text-muted-foreground">{entry.caffeineAmount}mg</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingId(entry.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {entry.caffeineAmount}mg
                  </button>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(entry.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove {entry.drink}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
