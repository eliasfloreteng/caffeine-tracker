"use client"

import { useMemo } from "react"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"
import { type CaffeineEntry, calculateCaffeineLevel } from "@/lib/caffeine-utils"

interface CaffeineChartProps {
  entries: CaffeineEntry[]
}

export function CaffeineChart({ entries }: CaffeineChartProps) {
  const chartData = useMemo(() => {
    if (entries.length === 0) return []

    const now = new Date()
    const intervalMinutes = 15

    // Determine smart start time: find the earliest point where caffeine is > 0.5mg
    // looking back up to 24 hours, then add a small buffer
    let startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const scanStep = 30 * 60 * 1000 // scan in 30-min steps for performance
    let firstNonZero = now // fallback to now if nothing found

    for (let t = startTime.getTime(); t <= now.getTime(); t += scanStep) {
      const checkTime = new Date(t)
      const level = calculateCaffeineLevel(entries, checkTime)
      if (level > 0.5) {
        firstNonZero = checkTime
        break
      }
    }

    // Start 1 hour before first non-zero, but not more than 24h ago
    startTime = new Date(Math.max(
      firstNonZero.getTime() - 1 * 60 * 60 * 1000,
      now.getTime() - 24 * 60 * 60 * 1000
    ))

    // Determine smart end time: find when caffeine drops below 1mg in the future,
    // then add a buffer. Look ahead up to 36 hours.
    const maxFuture = new Date(now.getTime() + 36 * 60 * 60 * 1000)
    let endTime = maxFuture
    const currentLevel = calculateCaffeineLevel(entries, now)

    if (currentLevel > 1) {
      for (let t = now.getTime(); t <= maxFuture.getTime(); t += scanStep) {
        const checkTime = new Date(t)
        const level = calculateCaffeineLevel(entries, checkTime)
        if (level < 1) {
          // Add 2 hours buffer after it hits near-zero
          endTime = new Date(Math.min(checkTime.getTime() + 2 * 60 * 60 * 1000, maxFuture.getTime()))
          break
        }
      }
    } else {
      // If current level is already low, show at least 8 hours into the future
      endTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    }

    // Ensure minimum window of 6 hours
    const minWindow = 6 * 60 * 60 * 1000
    if (endTime.getTime() - startTime.getTime() < minWindow) {
      endTime = new Date(startTime.getTime() + minWindow)
    }

    const data = []
    let currentTime = new Date(startTime)

    while (currentTime <= endTime) {
      const level = calculateCaffeineLevel(entries, currentTime)
      data.push({
        time: currentTime.getTime(),
        caffeine: Math.round(level * 10) / 10,
        label: currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isFuture: currentTime > now,
      })
      currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000)
    }

    return data
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        <p>Add drinks to see your caffeine curve</p>
      </div>
    )
  }

  const now = new Date().getTime()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="caffeineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.5} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          tickLine={false}
          className="text-muted-foreground"
          interval="preserveStartEnd"
          tickFormatter={(timestamp) =>
            new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          className="text-muted-foreground"
          tickFormatter={(value) => `${value}mg`}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--popover-foreground))",
          }}
          formatter={(value: number | undefined) => [`${value ?? 0}mg`, "Caffeine"]}
          labelFormatter={(timestamp) =>
            new Date(timestamp).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        />
        <ReferenceLine
          y={30}
          stroke="hsl(142, 76%, 36%)"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          label={{
            value: "30mg",
            position: "right",
            fill: "hsl(142, 76%, 36%)",
            fontSize: 11,
          }}
        />
        <ReferenceLine
          x={chartData.find((d) => d.time >= now)?.time}
          stroke="hsl(280, 65%, 60%)"
          strokeDasharray="5 5"
          label={{
            value: "Now",
            position: "top",
            fill: "hsl(280, 65%, 60%)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="caffeine"
          stroke="hsl(142, 76%, 36%)"
          strokeWidth={2}
          fill="url(#caffeineGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
