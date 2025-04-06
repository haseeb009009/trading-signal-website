import { TrendingUp, TrendingDown, ArrowDownUp, CandlestickChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TradingPattern } from "@/lib/types"

interface PatternRecognitionProps {
  patterns: TradingPattern[]
}

export default function PatternRecognition({ patterns }: PatternRecognitionProps) {
  if (patterns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-2 text-muted-foreground">
        <CandlestickChart className="h-6 w-6 mb-1" />
        <p className="text-xs">No patterns</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {patterns.map((pattern, index) => (
        <div key={index} className="flex items-start gap-2">
          {getPatternIcon(pattern.type)}
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-medium">{pattern.name}</h3>
              <Badge variant={getPatternVariant(pattern.bias)} className="text-[10px] py-0 px-2 h-4">
                {pattern.bias}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">{pattern.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function getPatternIcon(type: string) {
  switch (type) {
    case "reversal":
      return <ArrowDownUp className="h-4 w-4 text-purple-500" />
    case "bullish":
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case "bearish":
      return <TrendingDown className="h-4 w-4 text-red-500" />
    default:
      return <CandlestickChart className="h-4 w-4 text-blue-500" />
  }
}

function getPatternVariant(bias: string) {
  switch (bias) {
    case "Bullish":
      return "success"
    case "Bearish":
      return "destructive"
    default:
      return "outline"
  }
}

