"use client"

import { useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface StudyParam {
  key: string
  value: number | string
  color?: string
}

interface TradingViewWidgetProps {
  symbol: string
  interval: string
  theme?: "light" | "dark"
  width?: string | number
  height?: string | number
  studies?: string[]
  studyParams?: StudyParam[]
}

export default function TradingViewWidget({
  symbol,
  interval,
  theme = "dark",
  width = "100%",
  height = 400,
  studies = ["MASimple@tv-basicstudies", "MASimple@tv-basicstudies"],
  studyParams = [
    { key: "length", value: 6, color: "green" },
    { key: "length", value: 14, color: "red" },
  ],
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    // Format symbol for TradingView
    let formattedSymbol = symbol

    // Handle crypto pairs
    if (symbol === "BTC/USD") {
      formattedSymbol = "BITSTAMP:BTCUSD"
    } else if (symbol === "ETH/USD") {
      formattedSymbol = "BITSTAMP:ETHUSD"
    }
    // Handle forex pairs
    else {
      formattedSymbol = "FX:" + symbol.replace("/", "")
    }

    // Format interval for TradingView
    const formattedInterval = interval.replace("m", "")

    // Generate a unique ID for the container
    const containerId = `tradingview_widget_${Math.floor(Math.random() * 1000000)}`

    // Set the ID on the container element
    if (containerRef.current) {
      containerRef.current.id = containerId
    }

    // Create the script element
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: formattedSymbol,
          interval: formattedInterval,
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          toolbar_bg: theme === "dark" ? "#2A2E39" : "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: containerId,
          hide_top_toolbar: true,
          hide_legend: false, // Show legend to see MA indicators
          save_image: false,
          loading_screen: { backgroundColor: "transparent" },
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#22c55e",
            "mainSeriesProperties.candleStyle.downColor": "#ef4444",
            "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
          },
          studies_overrides: {
            // MA 6 (first study)
            "MA Cross.ma1.color": "#22c55e",
            "MA Cross.ma1.linewidth": 2,
            "MA Cross.ma1.visible": true,
            "MA Cross.ma1.plottype": 0,

            // MA 14 (second study)
            "MA Cross.ma2.color": "#ef4444",
            "MA Cross.ma2.linewidth": 2,
            "MA Cross.ma2.visible": true,
            "MA Cross.ma2.plottype": 0,

            // Individual MAs
            "Moving Average.plot.color": "#22c55e",
            "Moving Average.plot.linewidth": 2,
          },
          // Load the chart with pre-defined studies
          studies: [
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 6,
                source: "close",
              },
              styles: {
                plot: {
                  color: "#22c55e",
                  linewidth: 2,
                },
              },
            },
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: 14,
                source: "close",
              },
              styles: {
                plot: {
                  color: "#f23645",
                  linewidth: 2,
                },
              },
            },
          ],
        })
      }
    }

    // Add the script to the document
    document.head.appendChild(script)
    scriptRef.current = script

    // Clean up
    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
      }
    }
  }, [symbol, interval, theme, studies])

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full h-[400px]">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  )
}

// Add TradingView type definition
declare global {
  interface Window {
    TradingView: any
  }
}

