// src/features/permissions/PermissionsAdminPage.jsx
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../app/queryClient'
import {
  Button,
  Card,
  DataTable,
  Input,
  Modal,
  Spinner,
} from '../../components/common/Ui'
import { extractError } from '../../services/http'
import {
  createPermission,
  deactivatePermission,
  listPermissions,
  updatePermission,
} from '../../services/endpoints'
import { useAuth } from '../auth/AuthProvider'
import { usePermission } from '../auth/useAccess'

const emptyForm = { code: '', resource: '', action: '', description: '' }

const PermissionsAdminPage = () => {
  const can = usePermission()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  const permissions = useQuery({
    queryKey: queryKeys.permissions({ list: true }),
    queryFn: () => listPermissions({ page_size: 200 }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['permissions'] })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      modal?.id ? updatePermission(modal.id, payload) : createPermission(payload),
    onSuccess: () => {
      invalidate()
      setModal(null)
    },
    onError: (err) => setError(extractError(err)),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivatePermission(id),
    onSuccess: invalidate,
  })

  const submit = (event) => {
    event.preventDefault()
    setError(null)
    const payload = modal?.id
      ? { description: form.description }
      : {
          code: form.code,
          resource: form.resource,
          action: form.action,
          description: form.description,
        }
    saveMutation.mutate(payload)
  }

  const columns = [
    { header: 'Code', key: 'code' },
    { header: 'Resource', key: 'resource' },
    { header: 'Action', key: 'action' },
    {
      header: 'Type',
      render: (r) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs uppercase tracking-wide font-medium ${
            r.is_system ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {r.is_system ? 'system' : 'custom'}
        </span>
      ),
    },
    {
      header: 'Effective',
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
          {r.is_effective ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Active',
      render: (r) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
            r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {r.is_active ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {can('permissions.manage') && (
            <Button
              variant="secondary"
              className="text-xs py-1"
              onClick={() => {
                setForm({
                  code: row.code,
                  resource: row.resource,
                  action: row.action,
                  description: row.description || '',
                })
                setError(null)
                setModal(row)
              }}
            >
              Edit
            </Button>
          )}
          {can('permissions.manage') && !row.is_system && row.is_active && (
            <Button
              variant="danger"
              className="text-xs py-1"
              onClick={() => {
                deactivateMutation.mutate(row.id)
              }}
            >
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Permission Catalog"
        actions={
          user?.is_protected_admin && (
            <Button
              onClick={() => {
                setForm(emptyForm)
                setError(null)
                setModal({})
              }}
            >
              + New permission
            </Button>
          )
        }
      >
        <p className="mb-4 text-xs text-slate-500">
          Enforced permission registry. Only effective registered permissions grant capabilities across the application.
        </p>
        {permissions.isLoading ? (
          <Spinner />
        ) : (
          <DataTable columns={columns} rows={permissions.data?.results || []} />
        )}
      </Card>

      {modal !== null && (
        <Modal
          title={modal.id ? 'Edit permission' : 'New permission'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input
              label="Code"
              value={form.code}
              disabled={!!modal.id}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. reports.view"
              required
            />
            <Input
              label="Resource"
              value={form.resource}
              disabled={!!modal.id}
              onChange={(e) => setForm((p) => ({ ...p, resource: e.target.value }))}
              placeholder="e.g. reports"
              required
            />
            <Input
              label="Action"
              value={form.action}
              disabled={!!modal.id}
              onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
              placeholder="e.g. view"
              required
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description of what this permission allows"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save Permission
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default PermissionsAdminPage
