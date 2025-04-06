export function CustomCandleTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium">Open</span>
          <span className="tabular-nums">{data.open.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium">Close</span>
          <span className="tabular-nums">{data.close.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium">High</span>
          <span className="tabular-nums">{data.high.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium">Low</span>
          <span className="tabular-nums">{data.low.toFixed(4)}</span>
        </div>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

