// src/components/HeatmapCard.jsx
import React from 'react'

const getColorForChange = (changePercentage) => {
  const normalizedChange = Math.min(1, Math.abs(changePercentage) / 10)
  const intensity = Math.round(normalizedChange * 180)

  if (changePercentage > 0) {
    // Green tint
    return `rgb(${235 - Math.round(intensity * 0.7)}, 255, ${235 - Math.round(intensity * 0.7)})`
  } else if (changePercentage < 0) {
    // Red tint
    return `rgb(255, ${235 - Math.round(intensity * 0.7)}, ${235 - Math.round(intensity * 0.7)})`
  } else {
    return '#f8fafc'
  }
}

const HeatmapCard = ({ data, title }) => {
  const combinedData = []
  const seenTickers = new Set()

  if (data && data.topGainers) {
    data.topGainers.forEach((item) => {
      if (!seenTickers.has(item.ticker)) {
        combinedData.push(item)
        seenTickers.add(item.ticker)
      }
    })
  }

  if (data && data.topLosers) {
    data.topLosers.forEach((item) => {
      if (!seenTickers.has(item.ticker)) {
        combinedData.push(item)
        seenTickers.add(item.ticker)
      }
    })
  }

  combinedData.sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage))

  if (combinedData.length === 0) {
    return (
      <div className="card text-center text-slate-500 py-8">
        No data available for {title || 'this heatmap'}.
      </div>
    )
  }

  return (
    <div className="card">
      <h4 className="card-title">{title}</h4>
      <div className="heatmap-grid">
        {combinedData.slice(0, 30).map((item) => (
          <div
            key={item.ticker}
            className="heatmap-block border border-slate-200"
            style={{ backgroundColor: getColorForChange(item.changePercentage) }}
          >
            <div className="font-bold text-slate-900">{item.ticker}</div>
            <div
              className="heatmap-block-change"
              style={{ color: item.changePercentage > 0 ? '#15803d' : '#b91c1c' }}
            >
              {item.changePercentage > 0 ? '+' : ''}
              {Number(item.changePercentage).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              ${Number(item.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeatmapCard
