// src/features/roles/RolesAdminPage.jsx
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidateAuthorization, queryKeys } from '../../app/queryClient'
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
  createRole,
  deactivateRole,
  getRoleMenus,
  getRolePermissions,
  listMenus,
  listPermissions,
  listRoles,
  setRoleMenus,
  setRolePermissions,
  updateRole,
} from '../../services/endpoints'
import { usePermission } from '../auth/useAccess'

const emptyForm = { code: '', name: '', description: '', is_active: true }

const RolesAdminPage = () => {
  const can = usePermission()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  const roles = useQuery({
    queryKey: queryKeys.roles({ list: true }),
    queryFn: () => listRoles({ page_size: 200 }),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    invalidateAuthorization(queryClient)
  }

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      modal?.id ? updateRole(modal.id, payload) : createRole(payload),
    onSuccess: () => {
      invalidate()
      setModal(null)
    },
    onError: (err) => setError(extractError(err)),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateRole(id),
    onSuccess: invalidate,
  })

  const submit = (event) => {
    event.preventDefault()
    setError(null)
    const payload = modal?.id
      ? { name: form.name, description: form.description, is_active: form.is_active }
      : { code: form.code, name: form.name, description: form.description }
    saveMutation.mutate(payload)
  }

  const columns = [
    { header: 'Code', key: 'code' },
    { header: 'Name', key: 'name' },
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
    { header: 'Users', key: 'user_count' },
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
          {can('roles.manage') && (
            <Button
              variant="secondary"
              className="text-xs py-1"
              onClick={() => {
                setForm({
                  code: row.code,
                  name: row.name,
                  description: row.description || '',
                  is_active: row.is_active,
                })
                setError(null)
                setModal(row)
              }}
            >
              Edit
            </Button>
          )}
          {can('permissions.assign') && (
            <Button
              variant="secondary"
              className="text-xs py-1"
              onClick={() => setModal({ permissionsFor: row })}
            >
              Permissions
            </Button>
          )}
          {can('menus.assign') && (
            <Button
              variant="secondary"
              className="text-xs py-1"
              onClick={() => setModal({ menusFor: row })}
            >
              Menus
            </Button>
          )}
          {can('roles.manage') && !row.is_system && row.is_active && (
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
        title="Role Management"
        actions={
          can('roles.manage') && (
            <Button
              onClick={() => {
                setForm(emptyForm)
                setError(null)
                setModal({})
              }}
            >
              + New role
            </Button>
          )
        }
      >
        {roles.isLoading ? (
          <Spinner />
        ) : (
          <DataTable columns={columns} rows={roles.data?.results || []} />
        )}
      </Card>

      {modal && !modal.permissionsFor && !modal.menusFor && (
        <Modal title={modal.id ? 'Edit role' : 'New role'} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!modal.id && (
              <Input
                label="Role Code"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g. portfolio_manager"
                required
              />
            )}
            <Input
              label="Role Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Portfolio Manager"
              required
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            {modal.id && (
              <label className="flex items-center gap-2 text-sm pt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                />
                Active
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save Role
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.permissionsFor && (
        <RolePermissionsModal
          role={modal.permissionsFor}
          onClose={() => setModal(null)}
          onSaved={() => {
            invalidate()
            setModal(null)
          }}
        />
      )}

      {modal?.menusFor && (
        <RoleMenusModal
          role={modal.menusFor}
          onClose={() => setModal(null)}
          onSaved={invalidate}
        />
      )}
    </div>
  )
}

const RolePermissionsModal = ({ role, onClose, onSaved }) => {
  const permissions = useQuery({
    queryKey: queryKeys.permissions({ all: true }),
    queryFn: () => listPermissions({ page_size: 200 }),
  })
  const current = useQuery({
    queryKey: ['role-permissions', role.id],
    queryFn: () => getRolePermissions(role.id),
  })
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  const codes = selected ?? current.data?.permission_codes ?? []

  const mutation = useMutation({
    mutationFn: () => setRolePermissions(role.id, codes),
    onSuccess: onSaved,
    onError: (err) => setError(extractError(err)),
  })

  const toggle = (code) =>
    setSelected(codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code])

  return (
    <Modal title={`Permissions for ${role.code}`} onClose={onClose}>
      {permissions.isLoading || current.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {(permissions.data?.results || []).map((perm) => (
              <label
                key={perm.code}
                className="flex items-center gap-2.5 text-xs p-2 rounded border border-slate-100 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={codes.includes(perm.code)}
                  onChange={() => toggle(perm.code)}
                  className="rounded text-blue-600"
                />
                <div>
                  <span className="font-semibold text-slate-800">{perm.code}</span>
                  <span className="ml-2 text-slate-400">({perm.description})</span>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Save Permissions
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

const RoleMenusModal = ({ role, onClose, onSaved }) => {
  const menus = useQuery({
    queryKey: queryKeys.menus({ all: true }),
    queryFn: () => listMenus({ page_size: 200 }),
  })
  const current = useQuery({
    queryKey: ['role-menus', role.id],
    queryFn: () => getRoleMenus(role.id),
  })
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  const ids = selected ?? current.data?.menu_ids ?? []

  const mutation = useMutation({
    mutationFn: () => setRoleMenus(role.id, ids),
    onSuccess: () => {
      onSaved()
      onClose()
    },
    onError: (err) => setError(extractError(err)),
  })

  const toggle = (id) =>
    setSelected(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])

  return (
    <Modal title={`Navigation Menus for ${role.code}`} onClose={onClose}>
      {menus.isLoading || current.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
            {(menus.data?.results || []).map((menu) => (
              <label
                key={menu.id}
                className="flex items-center gap-2.5 text-xs p-2 rounded border border-slate-100 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={ids.includes(menu.id)}
                  onChange={() => toggle(menu.id)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-800">{menu.label}</span>
                <span className="text-slate-400">({menu.path})</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Save Menus
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default RolesAdminPage
