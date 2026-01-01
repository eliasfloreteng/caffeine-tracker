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

    // Display only past 24 hours and upcoming 24 hours (48 hours total)
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const data = []
    const intervalMinutes = 15
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
          formatter={(value: number) => [`${value}mg`, "Caffeine"]}
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
