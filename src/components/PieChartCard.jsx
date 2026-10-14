// src/components/PieChartCard.jsx
import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#64748b'
]

const PieChartCard = ({ data, title, dataKey, nameKey }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center text-slate-500 py-8">
        No data available for {title} chart.
      </div>
    )
  }

  const filteredData = data.filter(
    (item) => item[dataKey] && !isNaN(item[dataKey]) && item[dataKey] !== 0
  )

  return (
    <div className="card">
      <h4 className="card-title">{title}</h4>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Performance']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PieChartCard
