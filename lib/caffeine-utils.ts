export interface CaffeineEntry {
  id: string
  drink: string
  caffeineAmount: number
  timestamp: Date
  icon: string
}

export const CAFFEINE_HALF_LIFE_HOURS = 5

export function calculateCaffeineLevel(entries: CaffeineEntry[], atTime: Date): number {
  return entries.reduce((total, entry) => {
    const hoursElapsed = (atTime.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60)
    if (hoursElapsed < 0) return total
    const remaining = entry.caffeineAmount * Math.pow(0.5, hoursElapsed / CAFFEINE_HALF_LIFE_HOURS)
    return total + remaining
  }, 0)
}
