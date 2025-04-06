"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BarChart2, Loader2 } from "lucide-react"
import TradingViewWidget from "./trading-view-widget"
import SignalIndicator from "./signal-indicator"
import PatternRecognition from "./pattern-recognition"
import MarketStatus from "./market-status"
import { analyzeData, detectPatterns } from "@/lib/trading-utils"
import { fetchMarketData, generateFallbackData } from "@/lib/market-data-api"
import { isForexMarketOpen } from "@/lib/market-utils"
import type { CandleData, TimeFrame, Signal, TradingPattern } from "@/lib/types"
import SignalNotification from "./signal-notification"
import SimpleGuide from "./simple-guide"
import { useTheme } from "next-themes"

export default function TradingDashboard() {
  const [selectedPair, setSelectedPair] = useState<string>("EUR/USD")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("5m")
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [signal, setSignal] = useState<Signal>("NEUTRAL")
  const [patterns, setPatterns] = useState<TradingPattern[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)
  const [newSignal, setNewSignal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"live" | "simulated">("live")
  const [marketStatus, setMarketStatus] = useState({ isOpen: true, message: "" })
  const [signalTimeframe, setSignalTimeframe] = useState<TimeFrame>("5m")
  const { resolvedTheme } = useTheme()

  // Check market status
  useEffect(() => {
    const status = isForexMarketOpen()
    setMarketStatus(status)

    // Update market status every minute
    const interval = setInterval(() => {
      const updatedStatus = isForexMarketOpen()
      setMarketStatus(updatedStatus)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchMarketData(selectedPair, timeFrame)

      if (data.length === 0) {
        throw new Error("No data returned")
      }

      setCandleData(data)
      setDataSource("live")
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Using simulated data")

      // Fall back to generated data
      const fallbackData = generateFallbackData(timeFrame)
      setCandleData(fallbackData)
      setDataSource("simulated")
    } finally {
      setIsLoading(false)
    }
  }, [selectedPair, timeFrame])

  // Analyze data manually when button is clicked
  const handleAnalyze = () => {
    setIsAnalyzing(true)

    // Simulate a 2-second analysis process
    setTimeout(() => {
      try {
        // Analyze the current data for the selected timeframe
        const { signal: newSignal } = analyzeData(candleData)
        setSignal(newSignal)
        setPatterns(detectPatterns(candleData))

        // Store the timeframe this signal is for
        setSignalTimeframe(timeFrame)

        // Trigger new signal animation
        setNewSignal(true)
        setTimeout(() => setNewSignal(false), 3000)

        // Update last analyzed time
        setLastAnalyzed(new Date())
      } catch (err) {
        console.error("Error analyzing data:", err)
      } finally {
        setIsAnalyzing(false)
      }
    }, 2000) // 2-second delay
  }

  // Initial data load
  useEffect(() => {
    fetchChartData()

    // Set up polling interval for chart updates only
    const interval = setInterval(() => {
      fetchChartData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchChartData])

  // Handle timeframe change
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame)
  }

  // Handle pair change
  const handlePairChange = (newPair: string) => {
    setSelectedPair(newPair)
  }

  // Calculate when the next candle will form
  const getNextCandleTime = (): Date => {
    const now = new Date()
    const minutesInTimeFrame = Number.parseInt(signalTimeframe.replace("m", ""))
    const msInTimeFrame = minutesInTimeFrame * 60 * 1000
    const currentTimeMs = now.getTime()
    const remainder = currentTimeMs % msInTimeFrame

    // Time until next candle
    return new Date(currentTimeMs + (msInTimeFrame - remainder))
  }

  // Format the next candle time
  const formatNextCandleTime = (): string => {
    const nextCandle = getNextCandleTime()
    return nextCandle.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container mx-auto px-2 py-3 sm:p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-xl font-bold">Trading Signals</h1>
            <p className="text-xs text-muted-foreground">{selectedPair} signals</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Select value={selectedPair} onValueChange={handlePairChange}>
              <SelectTrigger className="h-8 text-xs w-[120px]">
                <SelectValue placeholder="Select pair" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                <SelectItem value="USD/CHF">USD/CHF</SelectItem>
                <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                <SelectItem value="ETH/USD">ETH/USD</SelectItem>
              </SelectContent>
            </Select>

            <MarketStatus />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="py-2 text-xs">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!marketStatus.isOpen && (
          <Alert variant="warning" className="py-2 text-xs">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription>{marketStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card className="md:col-span-3">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm">Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-2">
              <Tabs
                defaultValue="5m"
                className="w-full"
                onValueChange={(value) => handleTimeFrameChange(value as TimeFrame)}
                value={timeFrame}
              >
                <TabsList className="mb-2 h-8">
                  <TabsTrigger value="1m" className="text-xs px-2 py-1">
                    1m
                  </TabsTrigger>
                  <TabsTrigger value="5m" className="text-xs px-2 py-1">
                    5m
                  </TabsTrigger>
                  <TabsTrigger value="15m" className="text-xs px-2 py-1">
                    15m
                  </TabsTrigger>
                  <TabsTrigger value="30m" className="text-xs px-2 py-1">
                    30m
                  </TabsTrigger>
                </TabsList>

                {["1m", "5m", "15m", "30m"].map((tf) => (
                  <TabsContent key={tf} value={tf} className="mt-0">
                    <TradingViewWidget
                      symbol={selectedPair}
                      interval={tf}
                      theme={resolvedTheme === "light" ? "light" : "dark"}
                      height={300}
                      studies={["MASimple@tv-basicstudies", "MASimple@tv-basicstudies"]}
                      studyParams={[
                        { key: "length", value: 6, color: "green" },
                        { key: "length", value: 14, color: "red" },
                      ]}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm">Signal</CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-2">
                <SignalIndicator
                  signal={signal}
                  isNew={newSignal}
                  timeFrame={signalTimeframe}
                  nextCandleTime={formatNextCandleTime()}
                  isLoading={isAnalyzing}
                />
                <div className="mt-3">
                  <Button onClick={handleAnalyze} disabled={isAnalyzing || isLoading} className="w-full h-8 text-xs">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="mr-1 h-3 w-3" />
                        Analyze {timeFrame}
                      </>
                    )}
                  </Button>
                  {lastAnalyzed && (
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      Last: {lastAnalyzed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm">Patterns</CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-2">
                <PatternRecognition patterns={patterns} />
              </CardContent>
            </Card>
          </div>
        </div>
        <SignalNotification
          signal={signal}
          isNew={newSignal}
          timeFrame={signalTimeframe}
          nextCandleTime={formatNextCandleTime()}
        />
        <SimpleGuide />
      </div>
    </div>
  )
}

