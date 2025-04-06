import { Info } from "lucide-react"

interface DataSourceInfoProps {
  dataSource: "live" | "simulated"
}

export default function DataSourceInfo({ dataSource }: DataSourceInfoProps) {
  return (
    <div className="mt-8 p-4 bg-muted rounded-lg">
      <div className="flex items-start gap-2">
        <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <h3 className="font-medium mb-1">How to Use This Tool</h3>
          <p className="text-sm text-muted-foreground">
            {dataSource === "live" && "This application uses professional market data from TradingView."}
            {dataSource === "simulated" &&
              "This application is currently using simulated data for demonstration purposes."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Step 1:</strong> Select your currency pair and preferred timeframe (1m, 5m, 15m, or 30m).
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Step 2:</strong> Click the "Analyze" button to generate a trading signal for the next candle.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Step 3:</strong> The signal (BUY/SELL/NEUTRAL) predicts the price movement for the next candle in
            your selected timeframe.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            For example, if you're viewing the 5-minute chart and click "Analyze", the signal will predict the direction
            for the next 5-minute candle that forms. The system will show you exactly when that candle will appear.
          </p>
        </div>
      </div>
    </div>
  )
}

