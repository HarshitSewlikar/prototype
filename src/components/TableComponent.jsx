// src/components/TableComponent.jsx
import React from 'react'

const TableComponent = ({ data, columns, title }) => {
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return (
      <div className="table-container text-center text-slate-500 py-6">
        No data available for {title || 'this table'}.
      </div>
    )
  }

  return (
    <div className="table-container">
      {title && <h4 className="card-title">{title}</h4>}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.formatter
                      ? col.formatter(row[col.accessor])
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableComponent
