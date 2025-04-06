"use client"

import { useEffect, useState } from "react"
import { cva } from "class-variance-authority"
import { CheckCircle, AlertCircle, InfoIcon, Clock } from "lucide-react"
import type { Signal } from "@/lib/types"

interface SignalNotificationProps {
  signal: Signal
  isNew: boolean
  timeFrame: string
  nextCandleTime?: string
}

const notificationVariants = cva(
  "fixed bottom-4 right-4 p-3 rounded-lg shadow-lg transition-all duration-500 flex items-center gap-2 z-50 max-w-[250px]",
  {
    variants: {
      signal: {
        BUY: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        SELL: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
        NEUTRAL:
          "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
      },
    },
    defaultVariants: {
      signal: "NEUTRAL",
    },
  },
)

export default function SignalNotification({ signal, isNew, timeFrame, nextCandleTime }: SignalNotificationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isNew) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isNew, signal])

  if (!visible) return null

  return (
    <div
      className={notificationVariants({ signal })}
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
      }}
    >
      {signal === "BUY" && <CheckCircle className="h-4 w-4" />}
      {signal === "SELL" && <AlertCircle className="h-4 w-4" />}
      {signal === "NEUTRAL" && <InfoIcon className="h-4 w-4" />}
      <div>
        <div className="text-xs font-medium">{signal} Signal</div>
        <div className="text-[10px] opacity-80">{timeFrame} timeframe</div>
        {nextCandleTime && (
          <div className="text-[10px] opacity-80 flex items-center gap-1">
            <Clock className="h-2 w-2" />
            <span>Next: {nextCandleTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}

