// src/features/audit/AuditPage.jsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../app/queryClient'
import { Button, Card, DataTable, Input, Select, Spinner } from '../../components/common/Ui'
import { exportAuditCsv, listAudit } from '../../services/endpoints'
import { usePermission } from '../auth/useAccess'

const RESOURCE_TYPES = ['User', 'Role', 'Permission', 'Menu', 'Todo']

const cursorFrom = (url) => {
  if (!url) return null
  try {
    const params = new URLSearchParams(url.startsWith('?') ? url : url.slice(url.indexOf('?')))
    return params.get('cursor')
  } catch {
    return null
  }
}

const AuditPage = () => {
  const can = usePermission()
  const [filters, setFilters] = useState({ resource_type: '', search: '' })
  const [cursorStack, setCursorStack] = useState([null])
  const cursor = cursorStack[cursorStack.length - 1]

  const audit = useQuery({
    queryKey: queryKeys.audit({ ...filters, cursor }),
    queryFn: () =>
      listAudit({
        cursor: cursor || undefined,
        resource_type: filters.resource_type || undefined,
        search: filters.search || undefined,
      }),
  })

  const exportCsv = async () => {
    const csvData = await exportAuditCsv({
      resource_type: filters.resource_type || undefined,
      search: filters.search || undefined,
    })
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      header: 'Timestamp',
      render: (r) => (
        <span className="font-mono text-xs text-slate-600">
          {new Date(r.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Actor',
      render: (r) => (
        <span className="font-medium text-slate-800">{r.actor_username || '—'}</span>
      ),
    },
    {
      header: 'Action',
      render: (r) => (
        <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
          {r.action}
        </span>
      ),
    },
    {
      header: 'Resource',
      render: (r) => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {r.resource_type}
        </span>
      ),
    },
    { header: 'Object ID', render: (r) => r.object_id || '—' },
    {
      header: 'IP Address',
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.ip_address || '—'}</span>,
    },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Security & Operations Audit Trail"
        actions={
          can('audit.export') && (
            <Button variant="secondary" onClick={exportCsv}>
              ↓ Export CSV
            </Button>
          )
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <Select
            value={filters.resource_type}
            onChange={(e) => {
              setCursorStack([null])
              setFilters((p) => ({ ...p, resource_type: e.target.value }))
            }}
          >
            <option value="">All resources</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Search by action, object ID, or actor…"
            value={filters.search}
            onChange={(e) => {
              setCursorStack([null])
              setFilters((p) => ({ ...p, search: e.target.value }))
            }}
            className="w-72"
          />
        </div>

        {audit.isLoading ? (
          <Spinner />
        ) : (
          <>
            <DataTable columns={columns} rows={audit.data?.results || []} />
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Showing up to 15 events per page</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="text-xs py-1"
                  disabled={cursorStack.length <= 1}
                  onClick={() => setCursorStack((s) => s.slice(0, -1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  className="text-xs py-1"
                  disabled={!audit.data?.next}
                  onClick={() => setCursorStack((s) => [...s, cursorFrom(audit.data.next)])}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default AuditPage
