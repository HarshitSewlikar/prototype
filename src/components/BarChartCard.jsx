// src/components/BarChartCard.jsx
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const BarChartCard = ({ data, title, barKey, nameKey, barColor }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center text-slate-500 py-8">
        No data available for {title} chart.
      </div>
    )
  }

  const formattedData = data.map((item) => ({
    ...item,
    [barKey]: parseFloat(Number(item[barKey]).toFixed(2)),
  }))

  return (
    <div className="card">
      <h4 className="card-title">{title}</h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={nameKey} stroke="#64748b" fontSize={12} />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Change']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend />
            <Bar dataKey={barKey} fill={barColor || '#2563eb'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BarChartCard
