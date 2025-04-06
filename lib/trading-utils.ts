import type { CandleData, TimeFrame, Signal, AnalysisResult, TradingPattern } from "./types"

// Generate random candle data for demo purposes
export function generateCandleData(count: number, timeFrame: TimeFrame): CandleData[] {
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

  // Initial price around 1.05 for USD/EUR
  let prevClose = 1.05 + (Math.random() * 0.02 - 0.01)

  for (let i = 0; i < count; i++) {
    // Random price movement with some trend and volatility
    // Larger timeframes have more volatility
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

// Analyze candle data to generate trading signals using the new MA crossover strategy
export function analyzeData(data: CandleData[]): AnalysisResult {
  if (data.length < 15) {
    return {
      signal: "NEUTRAL",
      strength: 0,
      indicators: [],
    }
  }

  // Calculate the 6-period and 14-period moving averages
  const ma6 = calculateSMA(data, 6)
  const ma14 = calculateSMA(data, 14)

  // Calculate previous values (one period ago)
  const prevData = data.slice(0, -1)
  const prevMa6 = calculateSMA(prevData, 6)
  const prevMa14 = calculateSMA(prevData, 14)

  // Determine signal based on MA crossover
  let signal: Signal = "NEUTRAL"
  let strength = 50

  // Check for crossover: 6-period MA crossing above 14-period MA (BUY)
  if (prevMa6 < prevMa14 && ma6 > ma14) {
    signal = "BUY"
    strength = 80
  }
  // Check for crossover: 6-period MA crossing below 14-period MA (SELL)
  else if (prevMa6 > prevMa14 && ma6 < ma14) {
    signal = "SELL"
    strength = 80
  }
  // No crossover, but check relative positions
  else if (ma6 > ma14) {
    // 6-period MA above 14-period MA (bullish)
    signal = "BUY"
    strength = 60
  } else if (ma6 < ma14) {
    // 6-period MA below 14-period MA (bearish)
    signal = "SELL"
    strength = 60
  }

  return {
    signal,
    strength,
    indicators: [
      {
        name: "MA (6)",
        value: ma6,
        interpretation: "Fast moving average (green)",
      },
      {
        name: "MA (14)",
        value: ma14,
        interpretation: "Slow moving average (red)",
      },
      {
        name: "Crossover",
        value: ma6 - ma14,
        interpretation: ma6 > ma14 ? "Bullish" : "Bearish",
      },
    ],
  }
}

// Enhanced pattern detection function
export function detectPatterns(data: CandleData[]): TradingPattern[] {
  if (data.length < 10) return []

  const patterns: TradingPattern[] = []
  const recentCandles = data.slice(-20) // Use more candles for better pattern detection
  const lastCandle = recentCandles[recentCandles.length - 1]

  // 1. Check for doji (indecision)
  const bodySize = Math.abs(lastCandle.open - lastCandle.close)
  const totalRange = lastCandle.high - lastCandle.low
  if (totalRange > 0 && bodySize / totalRange < 0.1) {
    patterns.push({
      name: "Doji",
      type: "reversal",
      bias: "Neutral",
      description: "Indecision in market",
    })
  }

  // 2. Check for bullish engulfing
  if (recentCandles.length >= 2) {
    const c1 = recentCandles[recentCandles.length - 2]
    const c2 = lastCandle

    if (c1.close < c1.open && c2.close > c2.open && c2.open < c1.close && c2.close > c1.open) {
      patterns.push({
        name: "Bullish Engulfing",
        type: "bullish",
        bias: "Bullish",
        description: "Strong buying pressure",
      })
    }
  }

  // 3. Check for bearish engulfing
  if (recentCandles.length >= 2) {
    const c1 = recentCandles[recentCandles.length - 2]
    const c2 = lastCandle

    if (c1.close > c1.open && c2.close < c2.open && c2.open > c1.close && c2.close < c1.open) {
      patterns.push({
        name: "Bearish Engulfing",
        type: "bearish",
        bias: "Bearish",
        description: "Strong selling pressure",
      })
    }
  }

  // 4. Detect support level
  const supportLevel = findSupportLevel(recentCandles)
  if (supportLevel) {
    const distancePercent = (((lastCandle.close - supportLevel) / lastCandle.close) * 100).toFixed(2)
    patterns.push({
      name: "Support Level",
      type: "bullish",
      bias: "Bullish",
      description: `Price ${distancePercent}% above support at ${supportLevel.toFixed(5)}`,
    })
  }

  // 5. Detect resistance level
  const resistanceLevel = findResistanceLevel(recentCandles)
  if (resistanceLevel) {
    const distancePercent = (((resistanceLevel - lastCandle.close) / lastCandle.close) * 100).toFixed(2)
    patterns.push({
      name: "Resistance Level",
      type: "bearish",
      bias: "Bearish",
      description: `Price ${distancePercent}% below resistance at ${resistanceLevel.toFixed(5)}`,
    })
  }

  // 6. Check for hammer (bullish reversal)
  if (isHammer(lastCandle)) {
    patterns.push({
      name: "Hammer",
      type: "reversal",
      bias: "Bullish",
      description: "Potential bullish reversal",
    })
  }

  // 7. Check for shooting star (bearish reversal)
  if (isShootingStar(lastCandle)) {
    patterns.push({
      name: "Shooting Star",
      type: "reversal",
      bias: "Bearish",
      description: "Potential bearish reversal",
    })
  }

  // 8. Check for double top (bearish reversal)
  if (isDoubleTop(recentCandles)) {
    patterns.push({
      name: "Double Top",
      type: "reversal",
      bias: "Bearish",
      description: "Bearish reversal pattern",
    })
  }

  // 9. Check for double bottom (bullish reversal)
  if (isDoubleBottom(recentCandles)) {
    patterns.push({
      name: "Double Bottom",
      type: "reversal",
      bias: "Bullish",
      description: "Bullish reversal pattern",
    })
  }

  return patterns
}

// Helper function to find support level
function findSupportLevel(candles: CandleData[]): number | null {
  if (candles.length < 10) return null

  // Get all lows
  const lows = candles.map((c) => c.low)

  // Find potential support levels (local minima)
  const potentialSupports: number[] = []

  for (let i = 2; i < lows.length - 2; i++) {
    if (lows[i] <= lows[i - 1] && lows[i] <= lows[i - 2] && lows[i] <= lows[i + 1] && lows[i] <= lows[i + 2]) {
      potentialSupports.push(lows[i])
    }
  }

  if (potentialSupports.length === 0) return null

  // Group close support levels
  const groupedSupports: number[] = []
  const tolerance = 0.0005 // 5 pips for forex

  for (const support of potentialSupports) {
    // Check if this support is close to any existing grouped support
    let foundGroup = false
    for (let i = 0; i < groupedSupports.length; i++) {
      if (Math.abs(support - groupedSupports[i]) / support < tolerance) {
        // Average them
        groupedSupports[i] = (groupedSupports[i] + support) / 2
        foundGroup = true
        break
      }
    }

    if (!foundGroup) {
      groupedSupports.push(support)
    }
  }

  // Return the strongest support (the one with most touches)
  if (groupedSupports.length > 0) {
    // For simplicity, return the lowest support level that's below current price
    const currentPrice = candles[candles.length - 1].close
    const validSupports = groupedSupports.filter((s) => s < currentPrice)

    if (validSupports.length > 0) {
      return Math.max(...validSupports)
    }
  }

  return null
}

// Helper function to find resistance level
function findResistanceLevel(candles: CandleData[]): number | null {
  if (candles.length < 10) return null

  // Get all highs
  const highs = candles.map((c) => c.high)

  // Find potential resistance levels (local maxima)
  const potentialResistances: number[] = []

  for (let i = 2; i < highs.length - 2; i++) {
    if (highs[i] >= highs[i - 1] && highs[i] >= highs[i - 2] && highs[i] >= highs[i + 1] && highs[i] >= highs[i + 2]) {
      potentialResistances.push(highs[i])
    }
  }

  if (potentialResistances.length === 0) return null

  // Group close resistance levels
  const groupedResistances: number[] = []
  const tolerance = 0.0005 // 5 pips for forex

  for (const resistance of potentialResistances) {
    // Check if this resistance is close to any existing grouped resistance
    let foundGroup = false
    for (let i = 0; i < groupedResistances.length; i++) {
      if (Math.abs(resistance - groupedResistances[i]) / resistance < tolerance) {
        // Average them
        groupedResistances[i] = (groupedResistances[i] + resistance) / 2
        foundGroup = true
        break
      }
    }

    if (!foundGroup) {
      groupedResistances.push(resistance)
    }
  }

  // Return the strongest resistance (the one with most touches)
  if (groupedResistances.length > 0) {
    // For simplicity, return the highest resistance level that's above current price
    const currentPrice = candles[candles.length - 1].close
    const validResistances = groupedResistances.filter((r) => r > currentPrice)

    if (validResistances.length > 0) {
      return Math.min(...validResistances)
    }
  }

  return null
}

// Helper function to check for hammer pattern
function isHammer(candle: CandleData): boolean {
  const bodySize = Math.abs(candle.open - candle.close)
  const totalRange = candle.high - candle.low
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low

  // Hammer has a small body, long lower shadow, and small or no upper shadow
  return (
    bodySize / totalRange < 0.3 && // Small body
    lowerShadow / totalRange > 0.6 && // Long lower shadow
    candle.close > candle.open // Bullish candle
  )
}

// Helper function to check for shooting star pattern
function isShootingStar(candle: CandleData): boolean {
  const bodySize = Math.abs(candle.open - candle.close)
  const totalRange = candle.high - candle.low
  const upperShadow = candle.high - Math.max(candle.open, candle.close)

  // Shooting star has a small body, long upper shadow, and small or no lower shadow
  return (
    bodySize / totalRange < 0.3 && // Small body
    upperShadow / totalRange > 0.6 && // Long upper shadow
    candle.close < candle.open // Bearish candle
  )
}

// Helper function to check for double top pattern
function isDoubleTop(candles: CandleData[]): boolean {
  if (candles.length < 15) return false

  // Look for two peaks with a valley in between
  const recentCandles = candles.slice(-15)
  const highs = recentCandles.map((c) => c.high)

  // Find local maxima
  const peaks: number[] = []
  for (let i = 2; i < highs.length - 2; i++) {
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      peaks.push(i)
    }
  }

  // Need at least 2 peaks
  if (peaks.length < 2) return false

  // Check if the two highest peaks are at similar levels
  const sortedPeakIndices = peaks.sort((a, b) => highs[b] - highs[a])
  const peak1 = sortedPeakIndices[0]
  const peak2 = sortedPeakIndices[1]

  // Peaks should be at least 3 candles apart
  if (Math.abs(peak1 - peak2) < 3) return false

  // Peaks should be at similar levels
  const peakDiff = Math.abs(highs[peak1] - highs[peak2]) / highs[peak1]
  return peakDiff < 0.01 // Within 1%
}

// Helper function to check for double bottom pattern
function isDoubleBottom(candles: CandleData[]): boolean {
  if (candles.length < 15) return false

  // Look for two troughs with a peak in between
  const recentCandles = candles.slice(-15)
  const lows = recentCandles.map((c) => c.low)

  // Find local minima
  const troughs: number[] = []
  for (let i = 2; i < lows.length - 2; i++) {
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      troughs.push(i)
    }
  }

  // Need at least 2 troughs
  if (troughs.length < 2) return false

  // Check if the two lowest troughs are at similar levels
  const sortedTroughIndices = troughs.sort((a, b) => lows[a] - lows[b])
  const trough1 = sortedTroughIndices[0]
  const trough2 = sortedTroughIndices[1]

  // Troughs should be at least 3 candles apart
  if (Math.abs(trough1 - trough2) < 3) return false

  // Troughs should be at similar levels
  const troughDiff = Math.abs(lows[trough1] - lows[trough2]) / lows[trough1]
  return troughDiff < 0.01 // Within 1%
}

// Calculate Simple Moving Average (SMA)
function calculateSMA(data: CandleData[], period: number): number {
  if (data.length < period) return data[data.length - 1].close

  const prices = data.slice(-period).map((candle) => candle.close)
  return prices.reduce((sum, price) => sum + price, 0) / period
}

// Calculate Exponential Moving Average (EMA)
function calculateEMA(data: CandleData[], period: number): number {
  const prices = data.map((candle) => candle.close)
  return calculateEMAFromPrices(prices, period)
}

function calculateEMAFromPrices(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1]

  const k = 2 / (period + 1)

  // Start with SMA for the first EMA value
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period

  // Calculate EMA for the rest of the prices
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }

  return ema
}

