import { Info } from "lucide-react"

export default function SimpleGuide() {
  return (
    <div className="mt-4 p-3 bg-muted rounded-lg">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
          <h3 className="text-sm font-medium mb-1">How It Works</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Chart shows two moving averages: 6-period (green) and 14-period (red)</li>
            <li>
              • <span className="text-green-500 font-medium">BUY</span> when green line crosses above red line
            </li>
            <li>
              • <span className="text-red-500 font-medium">SELL</span> when green line crosses below red line
            </li>
            <li>• Click "Analyze" to check for signals in your selected timeframe</li>
            <li>• Signals predict the next candle's direction</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

