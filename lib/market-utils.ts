// Function to check if the forex market is currently open
export function isForexMarketOpen(): { isOpen: boolean; message: string } {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday, 6 = Saturday
  const hours = now.getUTCHours()
  const minutes = now.getUTCMinutes()

  // Convert current time to minutes since start of day in UTC
  const currentTimeInMinutes = hours * 60 + minutes

  // Weekend check (Saturday and Sunday)
  if (day === 6) {
    return {
      isOpen: false,
      message: "Forex market is closed (Weekend - Saturday)",
    }
  }

  if (day === 0) {
    // Sunday - Market opens at 22:00 UTC (5:00 PM ET)
    if (currentTimeInMinutes < 22 * 60) {
      return {
        isOpen: false,
        message: "Forex market is closed until 22:00 UTC Sunday (5:00 PM ET)",
      }
    }
  }

  if (day === 5) {
    // Friday - Market closes at 22:00 UTC (5:00 PM ET)
    if (currentTimeInMinutes >= 22 * 60) {
      return {
        isOpen: false,
        message: "Forex market is closed for the weekend",
      }
    }
  }

  // Check for major holidays (simplified - in a real app, you'd have a complete holiday calendar)
  // This is just a placeholder for demonstration
  const isHoliday = isForexHoliday(now)
  if (isHoliday.isHoliday) {
    return {
      isOpen: false,
      message: `Forex market is closed (Holiday: ${isHoliday.holidayName})`,
    }
  }

  // If we've passed all the closed conditions, the market is open
  return {
    isOpen: true,
    message: "Forex market is open",
  }
}

// Helper function to check for major forex holidays
// This is a simplified version - a real implementation would have a complete calendar
function isForexHoliday(date: Date): { isHoliday: boolean; holidayName: string } {
  const month = date.getUTCMonth() // 0-11
  const day = date.getUTCDate() // 1-31

  // Check for Christmas
  if (month === 11 && day === 25) {
    return { isHoliday: true, holidayName: "Christmas" }
  }

  // Check for New Year's Day
  if (month === 0 && day === 1) {
    return { isHoliday: true, holidayName: "New Year's Day" }
  }

  // Not a holiday
  return { isHoliday: false, holidayName: "" }
}

// Function to get the next market open time
export function getNextMarketOpenTime(): Date {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday, 6 = Saturday
  const nextOpenTime = new Date(now)

  if (day === 6) {
    // Saturday
    // Next open is Sunday at 22:00 UTC
    nextOpenTime.setUTCDate(now.getUTCDate() + 1) // Next day (Sunday)
    nextOpenTime.setUTCHours(22, 0, 0, 0)
  } else if (day === 0) {
    // Sunday
    // If before 22:00 UTC, open is today at 22:00 UTC
    // If after 22:00 UTC, market is already open
    if (now.getUTCHours() < 22) {
      nextOpenTime.setUTCHours(22, 0, 0, 0)
    }
  } else if (day === 5) {
    // Friday
    // If after 22:00 UTC, next open is Sunday at 22:00 UTC
    if (now.getUTCHours() >= 22) {
      nextOpenTime.setUTCDate(now.getUTCDate() + 2) // Skip to Sunday
      nextOpenTime.setUTCHours(22, 0, 0, 0)
    }
  }

  return nextOpenTime
}

// Function to format time until market opens
export function formatTimeUntilMarketOpens(): string {
  const now = new Date()
  const nextOpen = getNextMarketOpenTime()

  // If next open time is in the past, market is already open
  if (nextOpen <= now) {
    return "Market is open"
  }

  const diffMs = nextOpen.getTime() - now.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `Opens in ${diffHrs}h ${diffMins}m`
}

