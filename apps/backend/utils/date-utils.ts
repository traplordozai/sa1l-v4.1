/**
 * Formats a date to ISO string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toISOString()
}

/**
 * Formats a date to a human-readable string
 * @param date Date to format
 * @param locale Locale to use for formatting
 * @returns Human-readable date string
 */
export function formatDateHuman(date: Date | string | number, locale = "en-US"): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Calculates the difference between two dates in the specified unit
 * @param date1 First date
 * @param date2 Second date (defaults to now)
 * @param unit Unit to return the difference in
 * @returns Difference between dates in the specified unit
 */
export function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number = new Date(),
  unit: "seconds" | "minutes" | "hours" | "days" | "months" | "years" = "days",
): number {
  const d1 = date1 instanceof Date ? date1 : new Date(date1)
  const d2 = date2 instanceof Date ? date2 : new Date(date2)

  const diffMs = Math.abs(d2.getTime() - d1.getTime())

  switch (unit) {
    case "seconds":
      return Math.floor(diffMs / 1000)
    case "minutes":
      return Math.floor(diffMs / (1000 * 60))
    case "hours":
      return Math.floor(diffMs / (1000 * 60 * 60))
    case "days":
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    case "months":
      return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
    case "years":
      return d2.getFullYear() - d1.getFullYear()
    default:
      return diffMs
  }
}

/**
 * Adds time to a date
 * @param date Base date
 * @param amount Amount to add
 * @param unit Unit of time to add
 * @returns New date with added time
 */
export function addTime(
  date: Date | string | number,
  amount: number,
  unit: "seconds" | "minutes" | "hours" | "days" | "months" | "years",
): Date {
  const d = date instanceof Date ? new Date(date) : new Date(date)

  switch (unit) {
    case "seconds":
      d.setSeconds(d.getSeconds() + amount)
      break
    case "minutes":
      d.setMinutes(d.getMinutes() + amount)
      break
    case "hours":
      d.setHours(d.getHours() + amount)
      break
    case "days":
      d.setDate(d.getDate() + amount)
      break
    case "months":
      d.setMonth(d.getMonth() + amount)
      break
    case "years":
      d.setFullYear(d.getFullYear() + amount)
      break
  }

  return d
}

/**
 * Checks if a date is in the past
 * @param date Date to check
 * @returns Boolean indicating if the date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  const d = date instanceof Date ? date : new Date(date)
  return d.getTime() < Date.now()
}

/**
 * Checks if a date is in the future
 * @param date Date to check
 * @returns Boolean indicating if the date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  const d = date instanceof Date ? date : new Date(date)
  return d.getTime() > Date.now()
}