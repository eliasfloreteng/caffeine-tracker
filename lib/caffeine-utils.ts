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

export function calculateTimeUntilThreshold(
  entries: CaffeineEntry[],
  threshold: number
): Date | null {
  const currentLevel = calculateCaffeineLevel(entries, new Date())

  // If already below threshold or no caffeine in system
  if (currentLevel <= threshold) {
    return null
  }

  // Calculate hours until threshold using exponential decay formula
  // currentLevel * 0.5^(hours / halfLife) = threshold
  // Solving for hours: hours = halfLife * log(threshold / currentLevel) / log(0.5)
  const hoursUntilThreshold =
    (CAFFEINE_HALF_LIFE_HOURS * Math.log(threshold / currentLevel)) / Math.log(0.5)

  // Add hours to current time
  const estimatedTime = new Date()
  estimatedTime.setTime(estimatedTime.getTime() + hoursUntilThreshold * 60 * 60 * 1000)

  return estimatedTime
}
