import { ArrowUpCircle, ArrowDownCircle, MinusCircle, Clock, Loader2 } from "lucide-react"
import type { Signal } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface SignalIndicatorProps {
  signal: Signal
  isNew: boolean
  timeFrame?: string
  nextCandleTime?: string
  isLoading?: boolean
}

export default function SignalIndicator({
  signal,
  isNew,
  timeFrame,
  nextCandleTime,
  isLoading = false,
}: SignalIndicatorProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-2">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-bold mt-1">Analyzing</h2>
        <p className="text-xs text-muted-foreground mt-1">Calculating signals...</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center py-2 ${isNew ? "animate-pulse" : ""}`}>
      {signal === "BUY" && (
        <>
          <ArrowUpCircle className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold mt-1 text-green-500">BUY</h2>
          <p className="text-xs text-muted-foreground mt-1"></p>
          {timeFrame && (
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] py-0 px-2 h-5">
                {timeFrame}
              </Badge>
            </div>
          )}
          {nextCandleTime && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Next: {nextCandleTime}</span>
            </div>
          )}
          {isNew && (
            <Badge className="mt-1 bg-green-500/20 text-green-600 border-green-500 text-[10px] py-0 px-2 h-5">
              New
            </Badge>
          )}
        </>
      )}

      {signal === "SELL" && (
        <>
          <ArrowDownCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold mt-1 text-red-500">SELL</h2>
          <p className="text-xs text-muted-foreground mt-1"></p>
          {timeFrame && (
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] py-0 px-2 h-5">
                {timeFrame}
              </Badge>
            </div>
          )}
          {nextCandleTime && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Next: {nextCandleTime}</span>
            </div>
          )}
          {isNew && (
            <Badge className="mt-1 bg-red-500/20 text-red-600 border-red-500 text-[10px] py-0 px-2 h-5">New</Badge>
          )}
        </>
      )}

      {signal === "NEUTRAL" && (
        <>
          <MinusCircle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-xl font-bold mt-1 text-yellow-500">WAIT</h2>
          <p className="text-xs text-muted-foreground mt-1">No MA crossover yet</p>
          {timeFrame && (
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] py-0 px-2 h-5">
                {timeFrame}
              </Badge>
            </div>
          )}
          {nextCandleTime && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Next: {nextCandleTime}</span>
            </div>
          )}
          {isNew && (
            <Badge className="mt-1 bg-yellow-500/20 text-yellow-600 border-yellow-500 text-[10px] py-0 px-2 h-5">
              New
            </Badge>
          )}
        </>
      )}
    </div>
  )
}

