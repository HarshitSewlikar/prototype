// src/services/endpoints.js
// Real API client for the Django REST Framework backend.
// Endpoint functions return the same shapes the existing pages consume.
import { api, extractError, setAccessToken } from './http'

export { extractError }

const normalizeUser = (user) =>
  user
    ? {
        id: user.id,
        username: user.username,
        name: user.name || '',
        email: user.email || '',
        is_active: user.is_active,
        is_protected_admin: !!user.is_protected_admin,
        roles: user.roles || [],
      }
    : null

const normalizeOverride = (override) => ({
  ...override,
  effect: override.effect ? String(override.effect).toLowerCase() : override.effect,
})

// --- Auth ---
export const getSetupStatus = async () => {
  const { data } = await api.get('/auth/setup-status/')
  return { setup_complete: !!data.setup_complete }
}

export const bootstrap = async (payload) => {
  const { data } = await api.post('/auth/bootstrap/', payload)
  if (data.access) setAccessToken(data.access)
  return { user: normalizeUser(data.user) }
}

export const login = async ({ username, password }) => {
  const { data } = await api.post('/auth/login/', { username, password })
  if (data.access) setAccessToken(data.access)
  return { user: normalizeUser(data.user) }
}

export const logout = async () => {
  try {
    await api.post('/auth/logout/')
  } finally {
    setAccessToken(null)
  }
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me/')
  return { user: normalizeUser(data.user) }
}

export const getAccess = async () => {
  const { data } = await api.get('/auth/me/access/')
  return {
    permissions: data.permissions || [],
    is_protected_admin: !!data.is_protected_admin,
    menus: data.menus || [],
    modules: data.modules || [],
  }
}

// --- Modules ---
export const listModules = async () => {
  const { data } = await api.get('/modules/')
  return data.modules || []
}

export const setModuleEnabled = async (code, isEnabled) => {
  const { data } = await api.put(`/modules/${code}/`, { is_enabled: isEnabled })
  return data
}

// --- Users ---
export const listUsers = async (params = {}) => {
  const { data } = await api.get('/users/', { params })
  return data
}

export const createUser = async (payload) => {
  const { data } = await api.post('/users/', payload)
  return normalizeUser(data)
}

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${id}/`, payload)
  return normalizeUser(data)
}

export const deactivateUser = async (id) => {
  await api.delete(`/users/${id}/`)
  return { id }
}

export const getUserRoles = async (id) => {
  const { data } = await api.get(`/users/${id}/roles/`)
  return data
}

export const setUserRoles = async (id, roleIds) => {
  const { data } = await api.put(`/users/${id}/roles/`, { role_ids: roleIds })
  return data
}

export const getUserOverrides = async (id) => {
  const { data } = await api.get(`/users/${id}/permission-overrides/`)
  return {
    overrides: (data.overrides || []).map(normalizeOverride),
  }
}

export const setUserOverrides = async (id, overrides) => {
  const payload = (overrides || []).map((override) => ({
    permission_code: override.permission_code,
    effect: override.effect ? String(override.effect).toUpperCase() : override.effect,
  }))
  const { data } = await api.put(`/users/${id}/permission-overrides/`, {
    overrides: payload,
  })
  return data
}

// --- Roles ---
export const listRoles = async (params = {}) => {
  const { data } = await api.get('/roles/', { params })
  return data
}

export const createRole = async (payload) => {
  const { data } = await api.post('/roles/', payload)
  return data
}

export const updateRole = async (id, payload) => {
  const { data } = await api.patch(`/roles/${id}/`, payload)
  return data
}

export const deactivateRole = async (id) => {
  await api.delete(`/roles/${id}/`)
  return { id }
}

export const getRolePermissions = async (id) => {
  const { data } = await api.get(`/roles/${id}/permissions/`)
  return data
}

export const setRolePermissions = async (id, codes) => {
  const { data } = await api.put(`/roles/${id}/permissions/`, { permission_codes: codes })
  return data
}

export const getRoleMenus = async (id) => {
  const { data } = await api.get(`/roles/${id}/menus/`)
  return data
}

export const setRoleMenus = async (id, menuIds) => {
  const { data } = await api.put(`/roles/${id}/menus/`, { menu_ids: menuIds })
  return data
}

// --- Permissions ---
export const listPermissions = async (params = {}) => {
  const { data } = await api.get('/permissions/', { params })
  return data
}

export const createPermission = async (payload) => {
  const { data } = await api.post('/permissions/', payload)
  return data
}

export const updatePermission = async (id, payload) => {
  const { data } = await api.patch(`/permissions/${id}/`, payload)
  return data
}

export const deactivatePermission = async (id) => {
  await api.delete(`/permissions/${id}/`)
  return { id }
}

// --- Menus ---
export const listMenus = async (params = {}) => {
  const { data } = await api.get('/menus/', { params })
  return data
}

export const createMenu = async (payload) => {
  const { data } = await api.post('/menus/', payload)
  return data
}

export const updateMenu = async (id, payload) => {
  const { data } = await api.patch(`/menus/${id}/`, payload)
  return data
}

export const deactivateMenu = async (id) => {
  await api.delete(`/menus/${id}/`)
  return { id }
}

export const getNavigationMenus = async () => {
  const { data } = await api.get('/navigation/menus/')
  return data
}

// --- Todos ---
export const listTodos = async (params = {}) => {
  const { data } = await api.get('/todos/', { params })
  return data
}

export const createTodo = async (payload) => {
  const { data } = await api.post('/todos/', payload)
  return data
}

export const updateTodo = async (id, payload) => {
  const { data } = await api.patch(`/todos/${id}/`, payload)
  return data
}

export const deleteTodo = async (id) => {
  await api.delete(`/todos/${id}/`)
  return { id }
}

export const assignTodo = async (id, assignee) => {
  const { data } = await api.post(`/todos/${id}/assign/`, { assignee })
  return data
}

export const listTodoAssignees = async () => {
  const { data } = await api.get('/todos/assignees/')
  return data
}

export const setTodoStatus = async (id, status) => {
  const { data } = await api.post(`/todos/${id}/status/`, { status })
  return data
}

// --- Audit ---
export const listAudit = async (params = {}) => {
  const { data } = await api.get('/audit-logs/', { params })
  return data
}

export const exportAuditCsv = async (params = {}) => {
  const { data } = await api.get('/audit-logs/export/', {
    params,
    responseType: 'text',
    headers: { Accept: 'text/csv' },
  })
  return data
}

// --- Market ---
const marketResult = (response) => ({
  data: response.data,
  source: response.headers['x-data-source'] || 'unknown',
})

export const getDailyStock = async (symbol) => {
  const response = await api.get(`/market/stock-daily/${symbol}/`)
  return marketResult(response)
}

export const getSectors = async () => {
  const response = await api.get('/market/sector-performance/')
  return marketResult(response)
}

export const getMovers = async () => {
  const response = await api.get('/market/movers/')
  return marketResult(response)
}

export const getStockScore = async (symbol) => {
  const response = await api.get(`/market/stock-score/${symbol}/`)
  return marketResult(response)
}
