export interface CandleData {
  time: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type TimeFrame = "1m" | "5m" | "15m" | "30m"

export type Signal = "BUY" | "SELL" | "NEUTRAL"

export interface TradingPattern {
  name: string
  type: "bullish" | "bearish" | "reversal" | "continuation"
  bias: "Bullish" | "Bearish" | "Neutral"
  description: string
}

export interface AnalysisResult {
  signal: Signal
  strength: number // 0-100
  indicators: {
    name: string
    value: number
    interpretation: string
  }[]
}

