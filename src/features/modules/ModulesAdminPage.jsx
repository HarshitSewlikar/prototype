// src/features/modules/ModulesAdminPage.jsx
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidateAuthorization, queryKeys } from '../../app/queryClient'
import { Button, Card, DataTable, Spinner } from '../../components/common/Ui'
import { extractError } from '../../services/http'
import { listModules, setModuleEnabled } from '../../services/endpoints'
import { usePermission } from '../auth/useAccess'

const ModulesAdminPage = () => {
  const can = usePermission()
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)

  const modules = useQuery({
    queryKey: queryKeys.authModules,
    queryFn: listModules,
  })

  const mutation = useMutation({
    mutationFn: ({ code, isEnabled }) => setModuleEnabled(code, isEnabled),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.authModules })
      invalidateAuthorization(queryClient)
    },
    onError: (err) => setError(extractError(err)),
  })

  const canManage = can('modules.manage')

  const columns = [
    {
      header: 'Module',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.name}</span>
          <p className="font-mono text-[11px] text-slate-400">{row.code}</p>
        </div>
      ),
    },
    { header: 'Description', render: (row) => row.description || '—' },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
            row.is_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {row.is_enabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) =>
        canManage ? (
          <Button
            variant={row.is_enabled ? 'danger' : 'primary'}
            className="text-xs py-1"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ code: row.code, isEnabled: !row.is_enabled })}
          >
            {row.is_enabled ? 'Disable' : 'Enable'}
          </Button>
        ) : (
          <span className="text-xs text-slate-400">View only</span>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Feature Modules"
        actions={<span className="text-xs text-slate-400">Application-wide configuration</span>}
      >
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <p className="mb-4 text-xs text-slate-500">
          Disabling a module immediately hides its menus and blocks its API endpoints for every user,
          including administrators. Core administration menus remain available.
        </p>
        {modules.isLoading ? (
          <Spinner />
        ) : (
          <DataTable columns={columns} rows={modules.data || []} />
        )}
      </Card>
    </div>
  )
}

export default ModulesAdminPage
