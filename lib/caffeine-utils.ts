export interface CaffeineEntry {
  id: string
  drink: string
  caffeineAmount: number
  timestamp: Date
  icon: string
}

// First-Order Elimination Kinetics Parameters (Slow-Moderate Metabolizer)
export const CAFFEINE_HALF_LIFE_HOURS = 6.5
export const ELIMINATION_RATE_CONSTANT = Math.LN2 / CAFFEINE_HALF_LIFE_HOURS // k ≈ 0.1066 per hour
export const DEFAULT_BEDTIME_THRESHOLD = 50 // Conservative target (mg)

/**
 * Calculate caffeine remaining from a single dose using first-order elimination kinetics
 * Formula: C(t) = C₀ × e^(-k × t)
 *
 * @param initialDose - Initial caffeine dose in mg (C₀)
 * @param hoursElapsed - Time elapsed since consumption (t)
 * @returns Remaining caffeine in mg
 */
export function calculateRemainingCaffeine(initialDose: number, hoursElapsed: number): number {
  if (hoursElapsed < 0) return 0
  return initialDose * Math.exp(-ELIMINATION_RATE_CONSTANT * hoursElapsed)
}

/**
 * Calculate total caffeine level from multiple doses at a specific time
 * Formula: total_mg = Σ (dose_i × e^(-k × hours_since_dose_i))
 *
 * @param entries - Array of caffeine consumption entries
 * @param atTime - Time to calculate the level at
 * @returns Total caffeine in mg
 */
export function calculateCaffeineLevel(entries: CaffeineEntry[], atTime: Date): number {
  return entries.reduce((total, entry) => {
    const hoursElapsed = (atTime.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60)
    return total + calculateRemainingCaffeine(entry.caffeineAmount, hoursElapsed)
  }, 0)
}

/**
 * Calculate projected caffeine level at bedtime
 *
 * @param entries - Array of caffeine consumption entries
 * @param bedtime - Target bedtime
 * @returns Projected caffeine level at bedtime in mg
 */
export function calculateCaffeineAtBedtime(entries: CaffeineEntry[], bedtime: Date): number {
  return calculateCaffeineLevel(entries, bedtime)
}

/**
 * Calculate maximum additional caffeine that can be consumed now while staying under
 * the target threshold at bedtime
 * Formula: max_additional = headroom × e^(k × hours_until_bed)
 *
 * @param entries - Array of caffeine consumption entries
 * @param bedtime - Target bedtime
 * @param threshold - Target caffeine threshold at bedtime (default: 50mg)
 * @returns Maximum additional caffeine in mg (0 if already over threshold projection)
 */
export function calculateMaxAdditionalCaffeine(
  entries: CaffeineEntry[],
  bedtime: Date,
  threshold: number = DEFAULT_BEDTIME_THRESHOLD
): number {
  const now = new Date()
  const hoursUntilBed = (bedtime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilBed <= 0) return 0

  const projectedAtBed = calculateCaffeineAtBedtime(entries, bedtime)
  const headroom = threshold - projectedAtBed

  if (headroom <= 0) return 0

  // Reverse the decay calculation: how much now decays to headroom by bedtime
  return headroom * Math.exp(ELIMINATION_RATE_CONSTANT * hoursUntilBed)
}

/**
 * Calculate time to reach a target caffeine level
 * Formula: t = ln(current_level / target_level) / k
 *
 * @param entries - Array of caffeine consumption entries
 * @param threshold - Target caffeine level in mg
 * @returns Date when threshold will be reached, or null if already below
 */
export function calculateTimeUntilThreshold(
  entries: CaffeineEntry[],
  threshold: number
): Date | null {
  const currentLevel = calculateCaffeineLevel(entries, new Date())

  // If already below threshold or no caffeine in system
  if (currentLevel <= threshold) {
    return null
  }

  // Calculate hours until threshold: t = ln(current / target) / k
  const hoursUntilThreshold =
    Math.log(currentLevel / threshold) / ELIMINATION_RATE_CONSTANT

  // Add hours to current time
  const estimatedTime = new Date()
  estimatedTime.setTime(estimatedTime.getTime() + hoursUntilThreshold * 60 * 60 * 1000)

  return estimatedTime
}

/**
 * Calculate maximum dose that can be consumed now to be at or below threshold at bedtime
 * Formula: max_dose = threshold × e^(k × hours_until_bed)
 *
 * @param hoursUntilBed - Hours until bedtime
 * @param threshold - Target caffeine threshold at bedtime (default: 50mg)
 * @returns Maximum caffeine dose in mg
 */
export function calculateMaxDoseForBedtime(
  hoursUntilBed: number,
  threshold: number = DEFAULT_BEDTIME_THRESHOLD
): number {
  if (hoursUntilBed <= 0) return 0
  return threshold * Math.exp(ELIMINATION_RATE_CONSTANT * hoursUntilBed)
}

/**
 * Generate caffeine decay data points for charting
 *
 * @param initialDose - Initial caffeine dose in mg
 * @param hoursToProject - Number of hours to project
 * @param intervalMinutes - Interval between data points (default: 15 minutes)
 * @returns Array of { hours, remaining, percentRemaining }
 */
export function generateDecayCurve(
  initialDose: number,
  hoursToProject: number,
  intervalMinutes: number = 15
): Array<{ hours: number; remaining: number; percentRemaining: number }> {
  const points: Array<{ hours: number; remaining: number; percentRemaining: number }> = []
  const intervalHours = intervalMinutes / 60

  for (let hours = 0; hours <= hoursToProject; hours += intervalHours) {
    const remaining = calculateRemainingCaffeine(initialDose, hours)
    points.push({
      hours,
      remaining: Math.round(remaining * 10) / 10,
      percentRemaining: Math.round((remaining / initialDose) * 100),
    })
  }

  return points
}
