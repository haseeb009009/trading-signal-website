import type { CandleData, TimeFrame } from "./types"

// Twelve Data API key
const API_KEY = "afdaff9aded94e09ae065b460c044e90"

// Convert our timeframe format to Twelve Data format
function convertTimeFrame(timeFrame: TimeFrame): string {
  switch (timeFrame) {
    case "1m":
      return "1min"
    case "5m":
      return "5min"
    case "15m":
      return "15min"
    case "30m":
      return "30min"
    default:
      return "5min"
  }
}

// Format symbol for Twelve Data (e.g., "EUR/USD" to "EUR/USD")
function formatSymbol(symbol: string): string {
  return symbol
}

// Fetch data from Twelve Data API
export async function fetchMarketData(symbol: string, timeFrame: TimeFrame): Promise<CandleData[]> {
  try {
    const formattedSymbol = formatSymbol(symbol)
    const interval = convertTimeFrame(timeFrame)

    // Twelve Data time_series endpoint
    const url = `https://api.twelvedata.com/time_series?symbol=${formattedSymbol}&interval=${interval}&apikey=${API_KEY}&outputsize=100&format=json`

    console.log(`Fetching data from Twelve Data: ${url}`)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Check for error response
    if (data.status === "error") {
      throw new Error(data.message || "API error")
    }

    // Check if we have values in the response
    if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
      console.error("API Response:", data)
      throw new Error("No data values found in the API response")
    }

    // Convert the data to our format
    const candleData: CandleData[] = data.values
      .map((item: any) => ({
        time: new Date(item.datetime),
        open: Number.parseFloat(item.open),
        high: Number.parseFloat(item.high),
        low: Number.parseFloat(item.low),
        close: Number.parseFloat(item.close),
        volume: Number.parseInt(item.volume || "0"),
      }))
      .reverse() // Twelve Data returns newest first, we want oldest first

    return candleData
  } catch (error) {
    console.error("Error fetching market data:", error)
    // Fall back to generated data
    return generateFallbackData(timeFrame)
  }
}

// Fallback to generate data when API fails or for demo purposes
export function generateFallbackData(timeFrame: TimeFrame, basePrice = 1.05): CandleData[] {
  const count = 100 // Generate more candles for a better chart
  const data: CandleData[] = []
  const now = new Date()
  const minutesInTimeFrame = Number.parseInt(timeFrame.replace("m", ""))

  // Align the start time to the timeframe boundary
  const msInTimeFrame = minutesInTimeFrame * 60 * 1000
  const currentTimeMs = now.getTime()
  const remainder = currentTimeMs % msInTimeFrame
  const alignedTime = new Date(currentTimeMs - remainder)

  // Start from 'count' intervals ago
  let time = new Date(alignedTime.getTime() - count * msInTimeFrame)

  // Initial price
  let prevClose = basePrice + (Math.random() * 0.02 - 0.01)

  for (let i = 0; i < count; i++) {
    // Random price movement with some trend and volatility
    const volatilityFactor = Math.sqrt(minutesInTimeFrame) / 10
    const changePercent = (Math.random() - 0.5) * 0.01 * volatilityFactor
    const open = prevClose
    const close = open * (1 + changePercent)
    const high = Math.max(open, close) * (1 + Math.random() * 0.003 * volatilityFactor)
    const low = Math.min(open, close) * (1 - Math.random() * 0.003 * volatilityFactor)
    const volume = Math.floor(Math.random() * 1000 * volatilityFactor) + 500

    data.push({
      time: new Date(time),
      open,
      high,
      low,
      close,
      volume,
    })

    // Move to next time interval
    time = new Date(time.getTime() + msInTimeFrame)
    prevClose = close
  }

  return data
}

