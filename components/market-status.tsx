"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { isForexMarketOpen, formatTimeUntilMarketOpens } from "@/lib/market-utils"

export default function MarketStatus() {
  const [marketStatus, setMarketStatus] = useState({ isOpen: true, message: "Checking..." })
  const [timeUntilOpen, setTimeUntilOpen] = useState("")

  useEffect(() => {
    // Check market status initially
    updateMarketStatus()

    // Update every minute
    const interval = setInterval(() => {
      updateMarketStatus()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  function updateMarketStatus() {
    const status = isForexMarketOpen()
    setMarketStatus(status)

    if (!status.isOpen) {
      setTimeUntilOpen(formatTimeUntilMarketOpens())
    }
  }

  return (
    <div className={`flex items-center gap-1 ${marketStatus.isOpen ? "text-green-500" : "text-amber-500"}`}>
      {marketStatus.isOpen ? <Clock className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}

      <Badge variant={marketStatus.isOpen ? "success" : "warning"} className="font-normal text-[10px] py-0 px-2 h-5">
        {marketStatus.isOpen ? "Open" : "Closed"}
      </Badge>

      {!marketStatus.isOpen && <span className="text-[10px] text-muted-foreground">{timeUntilOpen}</span>}
    </div>
  )
}

