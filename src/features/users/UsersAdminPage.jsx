// src/features/users/UsersAdminPage.jsx
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../app/queryClient'
import {
  Button,
  Card,
  DataTable,
  Input,
  Modal,
  Pagination,
  Select,
  Spinner,
} from '../../components/common/Ui'
import { extractError } from '../../services/http'
import {
  createUser,
  deactivateUser,
  getUserOverrides,
  getUserRoles,
  listPermissions,
  listRoles,
  listUsers,
  setUserOverrides,
  setUserRoles,
  updateUser,
} from '../../services/endpoints'
import { usePermission } from '../auth/useAccess'

const emptyForm = { username: '', name: '', email: '', password: '', is_active: true }

const UsersAdminPage = () => {
  const can = usePermission()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  const users = useQuery({
    queryKey: queryKeys.users({ page, search }),
    queryFn: () => listUsers({ page, page_size: 25, search: search || undefined }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      modal?.id ? updateUser(modal.id, payload) : createUser(payload),
    onSuccess: () => {
      invalidate()
      setModal(null)
    },
    onError: (err) => setError(extractError(err)),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateUser(id),
    onSuccess: invalidate,
  })

  const openCreate = () => {
    setForm(emptyForm)
    setError(null)
    setModal({})
  }

  const openEdit = (user) => {
    setForm({
      username: user.username,
      name: user.name || '',
      email: user.email || '',
      password: '',
      is_active: user.is_active,
    })
    setError(null)
    setModal(user)
  }

  const submit = (event) => {
    event.preventDefault()
    setError(null)
    if (modal?.id) {
      const payload = { name: form.name, email: form.email, is_active: form.is_active }
      if (form.password) payload.password = form.password
      saveMutation.mutate(payload)
    } else {
      saveMutation.mutate({
        username: form.username,
        name: form.name,
        email: form.email,
        password: form.password,
        is_active: form.is_active,
      })
    }
  }

  const columns = [
    { header: 'Username', key: 'username' },
    { header: 'Name', render: (r) => r.name || '—' },
    { header: 'Email', render: (r) => r.email || '—' },
    {
      header: 'Roles',
      render: (r) =>
        r.roles?.length ? (
          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-700">
            {r.roles.join(', ')}
          </span>
        ) : (
          '—'
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
          {r.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {can('users.update') && (
            <Button variant="secondary" className="text-xs py-1" onClick={() => openEdit(row)}>
              Edit
            </Button>
          )}
          {can('roles.assign') && (
            <Button
              variant="secondary"
              className="text-xs py-1"
              onClick={() => setModal({ rolesFor: row })}
            >
              Roles
            </Button>
          )}
          {can('permissions.assign') && (
            <Button
              variant="secondary"
              className="text-xs py-1"
              onClick={() => setModal({ overridesFor: row })}
            >
              Overrides
            </Button>
          )}
          {can('users.deactivate') && row.is_active && !row.is_protected_admin && (
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
        title="User Accounts Management"
        actions={can('users.create') && <Button onClick={openCreate}>+ New user</Button>}
      >
        <div className="mb-4">
          <Input
            placeholder="Search by username, name, or email…"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />
        </div>
        {users.isLoading ? (
          <Spinner />
        ) : (
          <>
            <DataTable columns={columns} rows={users.data?.results || []} />
            <Pagination
              page={page}
              pageSize={25}
              total={users.data?.count}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      {modal && !modal.rolesFor && !modal.overridesFor && (
        <Modal title={modal.id ? 'Edit user' : 'New user'} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!modal.id && (
              <Input
                label="Username"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                required
              />
            )}
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              label={modal.id ? 'New password (optional)' : 'Password'}
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required={!modal.id}
            />
            {modal.id && (
              <label className="flex items-center gap-2 text-sm pt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                />
                Active Account
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save User
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.rolesFor && (
        <UserRolesModal
          user={modal.rolesFor}
          onClose={() => setModal(null)}
          onSaved={() => {
            invalidate()
            setModal(null)
          }}
        />
      )}

      {modal?.overridesFor && (
        <UserOverridesModal user={modal.overridesFor} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

const UserRolesModal = ({ user, onClose, onSaved }) => {
  const roles = useQuery({
    queryKey: queryKeys.roles({ all: true }),
    queryFn: () => listRoles({ page_size: 200 }),
  })
  const current = useQuery({
    queryKey: ['user-roles', user.id],
    queryFn: () => getUserRoles(user.id),
  })
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  const ids = selected ?? current.data?.role_ids ?? []

  const mutation = useMutation({
    mutationFn: () => setUserRoles(user.id, ids),
    onSuccess: onSaved,
    onError: (err) => setError(extractError(err)),
  })

  const toggle = (id) =>
    setSelected(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])

  return (
    <Modal title={`Roles for ${user.username}`} onClose={onClose}>
      {roles.isLoading || current.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="space-y-2">
            {(roles.data?.results || []).map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-2.5 text-sm p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={ids.includes(role.id)}
                  onChange={() => toggle(role.id)}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-slate-800">{role.name}</span>
                <span className="text-slate-400 text-xs">({role.code})</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Save Roles
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

const UserOverridesModal = ({ user, onClose }) => {
  const permissions = useQuery({
    queryKey: queryKeys.permissions({ all: true }),
    queryFn: () => listPermissions({ page_size: 200 }),
  })
  const current = useQuery({
    queryKey: ['user-overrides', user.id],
    queryFn: () => getUserOverrides(user.id),
  })
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)

  const effective =
    state ??
    Object.fromEntries(
      (current.data?.overrides || []).map((o) => [o.permission_code, o.effect])
    )

  const mutation = useMutation({
    mutationFn: () => {
      const overrides = Object.entries(effective)
        .filter(([, effect]) => effect)
        .map(([permission_code, effect]) => ({ permission_code, effect }))
      return setUserOverrides(user.id, overrides)
    },
    onSuccess: onClose,
    onError: (err) => setError(extractError(err)),
  })

  return (
    <Modal title={`Permission Overrides for ${user.username}`} onClose={onClose}>
      {permissions.isLoading || current.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {(permissions.data?.results || []).map((perm) => (
              <div
                key={perm.code}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded border border-slate-100 bg-slate-50/50"
              >
                <div>
                  <span className="font-semibold text-slate-800">{perm.code}</span>
                  <p className="text-[11px] text-slate-500">{perm.description}</p>
                </div>
                <Select
                  value={effective[perm.code] || ''}
                  onChange={(e) =>
                    setState({ ...effective, [perm.code]: e.target.value })
                  }
                  className="w-24 text-xs py-1"
                >
                  <option value="">Inherit</option>
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Save Overrides
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default UsersAdminPage
