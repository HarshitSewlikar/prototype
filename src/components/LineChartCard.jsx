// src/components/LineChartCard.jsx
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { prepareLineData } from '../utils/chartData'

const LineChartCard = ({ data, title, dataKey, tooltipLabel }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center text-slate-500 py-8">
        No data available for {title} chart.
      </div>
    )
  }

  const displayData = prepareLineData(data)

  return (
    <div className="card">
      <h4 className="card-title">{title}</h4>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                try {
                  return format(new Date(value), 'MMM dd')
                } catch {
                  return value
                }
              }}
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${Number(val).toFixed(0)}`}
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip
              labelFormatter={(label) => {
                try {
                  return `Date: ${format(new Date(label), 'MMM dd, yyyy')}`
                } catch {
                  return `Date: ${label}`
                }
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, tooltipLabel || 'Price']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default LineChartCard
