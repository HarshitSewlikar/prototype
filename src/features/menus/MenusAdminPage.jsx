// src/features/menus/MenusAdminPage.jsx
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidateAuthorization, queryKeys } from '../../app/queryClient'
import { COMPONENT_REGISTRY } from '../../app/componentRegistry'
import {
  Button,
  Card,
  DataTable,
  Input,
  Modal,
  Select,
  Spinner,
} from '../../components/common/Ui'
import { extractError } from '../../services/http'
import {
  createMenu,
  deactivateMenu,
  listMenus,
  listPermissions,
  updateMenu,
} from '../../services/endpoints'
import { usePermission } from '../auth/useAccess'

const COMPONENT_KEYS = Object.keys(COMPONENT_REGISTRY)

const emptyForm = {
  code: '',
  label: '',
  path: '/',
  component_key: COMPONENT_KEYS[0],
  required_permission: '',
  parent: '',
  sort_order: 0,
  is_active: true,
}

const MenusAdminPage = () => {
  const can = usePermission()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  const menus = useQuery({
    queryKey: queryKeys.menus({ list: true }),
    queryFn: () => listMenus({ page_size: 200 }),
  })
  const permissions = useQuery({
    queryKey: queryKeys.permissions({ all: true }),
    queryFn: () => listPermissions({ page_size: 200 }),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['menus'] })
    invalidateAuthorization(queryClient)
  }

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      modal?.id ? updateMenu(modal.id, payload) : createMenu(payload),
    onSuccess: () => {
      invalidate()
      setModal(null)
    },
    onError: (err) => setError(extractError(err)),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateMenu(id),
    onSuccess: invalidate,
  })

  const submit = (event) => {
    event.preventDefault()
    setError(null)
    saveMutation.mutate({
      code: form.code,
      label: form.label,
      path: form.path,
      component_key: form.component_key,
      required_permission: form.required_permission || null,
      parent: form.parent ? Number(form.parent) : null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    })
  }

  const columns = [
    { header: 'Code', key: 'code' },
    { header: 'Label', key: 'label' },
    { header: 'Path', key: 'path' },
    {
      header: 'Component',
      render: (r) => (
        <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          {r.component_key}
        </span>
      ),
    },
    { header: 'Permission', render: (r) => r.required_permission || '—' },
    { header: 'Order', key: 'sort_order' },
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
          {can('menus.manage') && (
            <Button
              variant="secondary"
              className="text-xs py-1"
              onClick={() => {
                setForm({
                  code: row.code,
                  label: row.label,
                  path: row.path,
                  component_key: row.component_key,
                  required_permission: row.required_permission || '',
                  parent: row.parent ?? '',
                  sort_order: row.sort_order,
                  is_active: row.is_active,
                })
                setError(null)
                setModal(row)
              }}
            >
              Edit
            </Button>
          )}
          {can('menus.manage') && row.is_active && (
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
        title="Navigation Menu Configuration"
        actions={
          can('menus.manage') && (
            <Button
              onClick={() => {
                setForm(emptyForm)
                setError(null)
                setModal({})
              }}
            >
              + New menu
            </Button>
          )
        }
      >
        <p className="mb-4 text-xs text-slate-500">
          Configure application navigation items. Visible menu items are filtered dynamically based on active roles and permissions.
        </p>
        {menus.isLoading ? (
          <Spinner />
        ) : (
          <DataTable columns={columns} rows={menus.data?.results || []} />
        )}
      </Card>

      {modal !== null && (
        <Modal title={modal.id ? 'Edit menu' : 'New menu'} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Input
              label="Code"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. portfolio"
              required
            />
            <Input
              label="Label"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="e.g. Portfolio"
              required
            />
            <Input
              label="Path"
              value={form.path}
              onChange={(e) => setForm((p) => ({ ...p, path: e.target.value }))}
              placeholder="e.g. /portfolio"
              required
            />
            <Select
              label="Mapped Component"
              value={form.component_key}
              onChange={(e) => setForm((p) => ({ ...p, component_key: e.target.value }))}
            >
              {COMPONENT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </Select>
            <Select
              label="Required Permission"
              value={form.required_permission}
              onChange={(e) =>
                setForm((p) => ({ ...p, required_permission: e.target.value }))
              }
            >
              <option value="">None (open to all authorized roles)</option>
              {(permissions.data?.results || []).map((perm) => (
                <option key={perm.code} value={perm.code}>
                  {perm.code} ({perm.description})
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Parent Menu"
                value={form.parent}
                onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}
              >
                <option value="">None (top level)</option>
                {(menus.data?.results || [])
                  .filter((m) => m.id !== modal.id)
                  .map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.label}
                    </option>
                  ))}
              </Select>
              <Input
                label="Sort Order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm pt-1">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              Active in Navigation
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save Menu
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default MenusAdminPage
