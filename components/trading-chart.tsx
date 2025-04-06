"use client"

import { useMemo } from "react"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, ComposedChart, Bar, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomCandleTooltip } from "./custom-chart-tooltip"
import type { CandleData, TimeFrame } from "@/lib/types"

interface TradingChartProps {
  data: CandleData[]
  timeFrame: TimeFrame
  isLoading?: boolean
}

export default function TradingChart({ data, timeFrame, isLoading = false }: TradingChartProps) {
  // Format data for the chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((candle) => {
      const isGreen = candle.close >= candle.open

      return {
        time: candle.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        // For candlestick body
        open: candle.open,
        close: candle.close,
        // For tooltip
        high: candle.high,
        low: candle.low,
        // For coloring
        isGreen,
        // For candlestick body
        height: Math.abs(candle.close - candle.open),
        // For candlestick body position
        y: isGreen ? candle.open : candle.close,
        // For candlestick wicks
        highWick: isGreen ? candle.high - candle.close : candle.high - candle.open,
        lowWick: isGreen ? candle.open - candle.low : candle.close - candle.low,
        highWickStart: isGreen ? candle.close : candle.open,
        lowWickStart: isGreen ? candle.open : candle.close,
        // For volume
        volume: candle.volume,
      }
    })
  }, [data])

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-[400px]" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  // Calculate price range for chart domain
  const prices = data.flatMap((candle) => [candle.high, candle.low])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const pricePadding = (maxPrice - minPrice) * 0.1

  return (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={{
          price: {
            label: "Price",
            color: "hsl(var(--chart-1))",
          },
          volume: {
            label: "Volume",
            color: "hsl(var(--chart-5))",
          },
        }}
        className="h-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} tickCount={6} minTickGap={20} />
            <YAxis
              yAxisId="price"
              domain={[minPrice - pricePadding, maxPrice + pricePadding]}
              tick={{ fontSize: 12 }}
              orientation="right"
              tickFormatter={(value) => value.toFixed(4)}
            />
            <YAxis yAxisId="volume" domain={[0, "dataMax"]} hide />

            <Tooltip content={<CustomCandleTooltip />} />

            {/* Candlestick bodies */}
            <Bar
              dataKey="height"
              yAxisId="price"
              fill="transparent"
              stroke="transparent"
              barSize={8}
              minPointSize={2}
              shape={(props) => {
                const { x, y, width, height, isGreen } = props
                return (
                  <rect
                    x={x - width / 2}
                    y={y}
                    width={width}
                    height={Math.max(height, 1)} // Ensure minimum height for visibility
                    fill={isGreen ? "var(--color-up, #16a34a)" : "var(--color-down, #dc2626)"}
                    stroke={isGreen ? "var(--color-up, #16a34a)" : "var(--color-down, #dc2626)"}
                  />
                )
              }}
            />

            {/* Candlestick wicks */}
            {chartData.map((candle, index) => {
              const x = index * (chartData.length > 30 ? 8 : 16) + 40 // Approximate x position
              return (
                <g key={`wick-${index}`}>
                  {/* High wick */}
                  {candle.highWick > 0 && (
                    <line
                      x1={x}
                      y1={candle.highWickStart}
                      x2={x}
                      y2={candle.highWickStart - candle.highWick}
                      stroke={candle.isGreen ? "var(--color-up, #16a34a)" : "var(--color-down, #dc2626)"}
                      strokeWidth={1}
                    />
                  )}
                  {/* Low wick */}
                  {candle.lowWick > 0 && (
                    <line
                      x1={x}
                      y1={candle.lowWickStart}
                      x2={x}
                      y2={candle.lowWickStart + candle.lowWick}
                      stroke={candle.isGreen ? "var(--color-up, #16a34a)" : "var(--color-down, #dc2626)"}
                      strokeWidth={1}
                    />
                  )}
                </g>
              )
            })}

            {/* Volume bars */}
            <Bar
              dataKey="volume"
              yAxisId="volume"
              fill="var(--color-volume, hsl(var(--chart-5)))"
              fillOpacity={0.3}
              barSize={4}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-2 flex items-center text-xs text-muted-foreground">
        <div className="mr-2">Candle progress:</div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${getCandleProgress(timeFrame)}%`,
            }}
          />
        </div>
      </div>
    </div>
  )

  function getCandleProgress(timeFrame: TimeFrame): number {
    const now = new Date()
    const minutesInTimeFrame = Number.parseInt(timeFrame.replace("m", ""))
    const msInTimeFrame = minutesInTimeFrame * 60 * 1000

    // Calculate how far we are into the current candle
    const currentTimeMs = now.getTime()
    const remainder = currentTimeMs % msInTimeFrame

    // Return as percentage
    return (remainder / msInTimeFrame) * 100
  }
}

