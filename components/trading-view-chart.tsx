"use client"

import { useEffect, useRef } from "react"
import { createChart, ColorType, CrosshairMode } from "lightweight-charts"
import type { CandleData, TimeFrame } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

interface TradingViewChartProps {
  data: CandleData[]
  timeFrame: TimeFrame
  isLoading?: boolean
}

export default function TradingViewChart({ data, timeFrame, isLoading = false }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === "dark"

  useEffect(() => {
    if (isLoading || !data || data.length === 0 || !chartContainerRef.current) return

    // Clean up previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    // Create new chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(60, 60, 60, 0.9)",
      },
      grid: {
        vertLines: { color: isDarkMode ? "rgba(197, 203, 206, 0.1)" : "rgba(197, 203, 206, 0.2)" },
        horzLines: { color: isDarkMode ? "rgba(197, 203, 206, 0.1)" : "rgba(197, 203, 206, 0.2)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isDarkMode ? "rgba(197, 203, 206, 0.3)" : "rgba(197, 203, 206, 0.8)",
      },
      rightPriceScale: {
        borderColor: isDarkMode ? "rgba(197, 203, 206, 0.3)" : "rgba(197, 203, 206, 0.8)",
      },
    })

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: isDarkMode ? "#22c55e" : "#16a34a", // Green
      downColor: isDarkMode ? "#ef4444" : "#dc2626", // Red
      borderVisible: false,
      wickUpColor: isDarkMode ? "#22c55e" : "#16a34a",
      wickDownColor: isDarkMode ? "#ef4444" : "#dc2626",
    })

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    // Format data for the chart
    const formattedCandleData = data.map((candle) => ({
      time: candle.time.getTime() / 1000,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))

    const formattedVolumeData = data.map((candle) => ({
      time: candle.time.getTime() / 1000,
      value: candle.volume,
      color:
        candle.close >= candle.open
          ? isDarkMode
            ? "rgba(34, 197, 94, 0.5)"
            : "rgba(22, 163, 74, 0.5)"
          : isDarkMode
            ? "rgba(239, 68, 68, 0.5)"
            : "rgba(220, 38, 38, 0.5)",
    }))

    // Set the data
    candlestickSeries.setData(formattedCandleData)
    volumeSeries.setData(formattedVolumeData)

    // Fit content
    chart.timeScale().fitContent()

    // Save chart reference for cleanup
    chartRef.current = chart

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    // Create resize observer
    resizeObserverRef.current = new ResizeObserver(handleResize)
    resizeObserverRef.current.observe(chartContainerRef.current)

    // Clean up
    return () => {
      if (resizeObserverRef.current && chartContainerRef.current) {
        resizeObserverRef.current.unobserve(chartContainerRef.current)
        resizeObserverRef.current = null
      }
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [data, isLoading, isDarkMode])

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

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full h-[400px]" />
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

