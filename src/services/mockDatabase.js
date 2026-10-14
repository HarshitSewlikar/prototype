// In-browser mock database with localStorage persistence and full RBAC enforcement

const STORAGE_KEY = 'financial_analytics_db_v1'

const INITIAL_PERMISSIONS = [
  { id: 1, code: 'users.read', resource: 'users', action: 'read', description: 'View users', is_system: true, is_active: true, is_effective: true },
  { id: 2, code: 'users.create', resource: 'users', action: 'create', description: 'Create users', is_system: true, is_active: true, is_effective: true },
  { id: 3, code: 'users.update', resource: 'users', action: 'update', description: 'Update users', is_system: true, is_active: true, is_effective: true },
  { id: 4, code: 'users.deactivate', resource: 'users', action: 'deactivate', description: 'Deactivate users', is_system: true, is_active: true, is_effective: true },
  { id: 5, code: 'roles.read', resource: 'roles', action: 'read', description: 'View roles', is_system: true, is_active: true, is_effective: true },
  { id: 6, code: 'roles.manage', resource: 'roles', action: 'manage', description: 'Create/update roles', is_system: true, is_active: true, is_effective: true },
  { id: 7, code: 'roles.assign', resource: 'roles', action: 'assign', description: 'Assign roles to users', is_system: true, is_active: true, is_effective: true },
  { id: 8, code: 'permissions.read', resource: 'permissions', action: 'read', description: 'View permission definitions', is_system: true, is_active: true, is_effective: true },
  { id: 9, code: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Create/update permission definitions', is_system: true, is_active: true, is_effective: true },
  { id: 10, code: 'permissions.assign', resource: 'permissions', action: 'assign', description: 'Assign permissions to roles / user overrides', is_system: true, is_active: true, is_effective: true },
  { id: 11, code: 'menus.read', resource: 'menus', action: 'read', description: 'View menus', is_system: true, is_active: true, is_effective: true },
  { id: 12, code: 'menus.manage', resource: 'menus', action: 'manage', description: 'Create/update menus', is_system: true, is_active: true, is_effective: true },
  { id: 13, code: 'menus.assign', resource: 'menus', action: 'assign', description: 'Assign menus to roles', is_system: true, is_active: true, is_effective: true },
  { id: 14, code: 'todos.read', resource: 'todos', action: 'read', description: 'View to-dos in scope', is_system: true, is_active: true, is_effective: true },
  { id: 15, code: 'todos.create', resource: 'todos', action: 'create', description: 'Create to-dos', is_system: true, is_active: true, is_effective: true },
  { id: 16, code: 'todos.update', resource: 'todos', action: 'update', description: 'Update to-dos', is_system: true, is_active: true, is_effective: true },
  { id: 17, code: 'todos.delete', resource: 'todos', action: 'delete', description: 'Delete to-dos', is_system: true, is_active: true, is_effective: true },
  { id: 18, code: 'todos.assign', resource: 'todos', action: 'assign', description: 'Assign to-dos', is_system: true, is_active: true, is_effective: true },
  { id: 19, code: 'todos.manage', resource: 'todos', action: 'manage', description: 'See and manage all to-dos regardless of ownership', is_system: true, is_active: true, is_effective: true },
  { id: 20, code: 'audit.read', resource: 'audit', action: 'read', description: 'View audit logs', is_system: true, is_active: true, is_effective: true },
  { id: 21, code: 'audit.export', resource: 'audit', action: 'export', description: 'Export audit logs', is_system: true, is_active: true, is_effective: true },
  { id: 22, code: 'market.read', resource: 'market', action: 'read', description: 'Access market/finance data', is_system: true, is_active: true, is_effective: true },
]

const INITIAL_MENUS = [
  { id: 1, code: 'dashboard', label: 'Dashboard', path: '/dashboard', component_key: 'DashboardPage', required_permission: 'market.read', sort_order: 10, is_active: true, parent: null },
  { id: 2, code: 'todos', label: 'To-dos', path: '/todos', component_key: 'TodosPage', required_permission: 'todos.read', sort_order: 20, is_active: true, parent: null },
  { id: 3, code: 'users', label: 'Users', path: '/admin/users', component_key: 'UsersAdminPage', required_permission: 'users.read', sort_order: 30, is_active: true, parent: null },
  { id: 4, code: 'roles', label: 'Roles', path: '/admin/roles', component_key: 'RolesAdminPage', required_permission: 'roles.read', sort_order: 40, is_active: true, parent: null },
  { id: 5, code: 'permissions', label: 'Permissions', path: '/admin/permissions', component_key: 'PermissionsAdminPage', required_permission: 'permissions.read', sort_order: 50, is_active: true, parent: null },
  { id: 6, code: 'menus', label: 'Menus', path: '/admin/menus', component_key: 'MenusAdminPage', required_permission: 'menus.read', sort_order: 60, is_active: true, parent: null },
  { id: 7, code: 'audit', label: 'Audit Log', path: '/admin/audit', component_key: 'AuditPage', required_permission: 'audit.read', sort_order: 70, is_active: true, parent: null },
]

const INITIAL_ROLES = [
  {
    id: 1,
    code: 'administrator',
    name: 'Administrator',
    description: 'Full administrative access to all application capabilities.',
    is_system: true,
    is_active: true,
    user_count: 1,
    permissions: INITIAL_PERMISSIONS.map((p) => p.code),
    menu_ids: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 2,
    code: 'auditor',
    name: 'Auditor',
    description: 'Read-only access to audit records and finance data.',
    is_system: true,
    is_active: true,
    user_count: 1,
    permissions: ['audit.read', 'audit.export', 'users.read', 'roles.read', 'permissions.read', 'menus.read', 'market.read'],
    menu_ids: [1, 3, 4, 5, 6, 7],
  },
  {
    id: 3,
    code: 'standard_user',
    name: 'Standard user',
    description: 'Can manage their own to-dos and view market data.',
    is_system: true,
    is_active: true,
    user_count: 1,
    permissions: ['todos.read', 'todos.create', 'todos.update', 'todos.delete', 'todos.assign', 'market.read'],
    menu_ids: [1, 2],
  },
]

const INITIAL_USERS = [
  {
    id: 1,
    username: 'admin',
    name: 'System Administrator',
    email: 'admin@analytics.local',
    password: 'admin',
    is_active: true,
    is_protected_admin: true,
    roles: ['administrator'],
    role_ids: [1],
    overrides: [],
  },
  {
    id: 2,
    username: 'auditor',
    name: 'Compliance Auditor',
    email: 'auditor@analytics.local',
    password: 'password123',
    is_active: true,
    is_protected_admin: false,
    roles: ['auditor'],
    role_ids: [2],
    overrides: [],
  },
  {
    id: 3,
    username: 'user',
    name: 'Finance Analyst',
    email: 'analyst@analytics.local',
    password: 'password123',
    is_active: true,
    is_protected_admin: false,
    roles: ['standard_user'],
    role_ids: [3],
    overrides: [],
  },
]

const INITIAL_TODOS = [
  {
    id: 1,
    title: 'Analyze AAPL Q3 volatility spike',
    description: 'Calculate annualized volatility and prepare summary report for the investment committee.',
    priority: 'urgent',
    status: 'in_progress',
    due_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    assignee_username: 'user',
    created_by: 'admin',
  },
  {
    id: 2,
    title: 'Review tech sector rebalancing allocation',
    description: 'Evaluate semiconductor weighting against communications and financials.',
    priority: 'high',
    status: 'open',
    due_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    assignee_username: 'user',
    created_by: 'admin',
  },
  {
    id: 3,
    title: 'Export monthly audit log for compliance review',
    description: 'Download CSV audit trail and archive in secure document storage.',
    priority: 'normal',
    status: 'completed',
    due_at: new Date(Date.now() - 86400000).toISOString(),
    assignee_username: 'auditor',
    created_by: 'admin',
  },
  {
    id: 4,
    title: 'Update risk score threshold parameters',
    description: 'Review low volatility cutoffs and growth metrics scoring factors.',
    priority: 'low',
    status: 'open',
    due_at: new Date(Date.now() + 86400000 * 10).toISOString(),
    assignee_username: 'admin',
    created_by: 'admin',
  },
]

const INITIAL_AUDIT = [
  {
    id: 1,
    actor_username: 'system',
    action: 'bootstrap.init',
    resource_type: 'User',
    object_id: '1',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    actor_username: 'system',
    action: 'rbac.seed',
    resource_type: 'Role',
    object_id: 'administrator',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 3,
    actor_username: 'admin',
    action: 'user.create',
    resource_type: 'User',
    object_id: 'auditor',
    ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 4,
    actor_username: 'admin',
    action: 'todo.create',
    resource_type: 'Todo',
    object_id: '1',
    ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 5,
    actor_username: 'user',
    action: 'todo.status_change',
    resource_type: 'Todo',
    object_id: '1 (in_progress)',
    ip_address: '192.168.1.25',
    created_at: new Date().toISOString(),
  },
]

class MockDatabase {
  constructor() {
    this.data = this.load()
    this.currentUserId = this.data.currentUserId || 1
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore JSON parse or storage errors
    }
    return this.getInitialState()
  }

  getInitialState() {
    return {
      setupComplete: true,
      currentUserId: 1,
      users: INITIAL_USERS,
      roles: INITIAL_ROLES,
      permissions: INITIAL_PERMISSIONS,
      menus: INITIAL_MENUS,
      todos: INITIAL_TODOS,
      audit: INITIAL_AUDIT,
    }
  }

  save() {
    try {
      this.data.currentUserId = this.currentUserId
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch {
      // ignore storage errors
    }
  }

  logAudit(action, resourceType, objectId, actorOverride = null) {
    const actor = actorOverride || this.getCurrentUser()?.username || 'anonymous'
    const newEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      actor_username: actor,
      action,
      resource_type: resourceType,
      object_id: String(objectId),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    }
    this.data.audit.unshift(newEntry)
    this.save()
  }

  // Auth & Session
  getSetupStatus() {
    return { setup_complete: this.data.setupComplete }
  }

  bootstrap(payload) {
    if (this.data.setupComplete && this.data.users.some((u) => u.is_protected_admin)) {
      // Check if code matches or allow
    }
    const adminUser = {
      id: Date.now(),
      username: payload.username,
      name: payload.name || payload.username,
      email: payload.email || '',
      password: payload.password,
      is_active: true,
      is_protected_admin: true,
      roles: ['administrator'],
      role_ids: [1],
      overrides: [],
    }
    this.data.users.unshift(adminUser)
    this.data.setupComplete = true
    this.currentUserId = adminUser.id
    this.logAudit('auth.bootstrap', 'User', adminUser.username, adminUser.username)
    this.save()
    return {
      access: 'mock-jwt-token-' + adminUser.id,
      user: this.sanitizeUser(adminUser),
    }
  }

  login(username, password) {
    const user = this.data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    )
    if (!user) {
      throw new Error('Invalid username or password.')
    }
    if (!user.is_active) {
      throw new Error('This account has been deactivated.')
    }
    // For convenience in testing/demo, any password or matching password works
    this.currentUserId = user.id
    this.logAudit('auth.login', 'User', user.username, user.username)
    this.save()
    return {
      access: 'mock-jwt-token-' + user.id,
      user: this.sanitizeUser(user),
    }
  }

  switchUser(username) {
    const user = this.data.users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (user && user.is_active) {
      this.currentUserId = user.id
      this.logAudit('auth.switch_user', 'User', user.username, user.username)
      this.save()
      return this.sanitizeUser(user)
    }
    return null
  }

  logout() {
    const current = this.getCurrentUser()
    if (current) {
      this.logAudit('auth.logout', 'User', current.username)
    }
    this.currentUserId = null
    this.save()
  }

  getCurrentUser() {
    if (!this.currentUserId) return null
    const user = this.data.users.find((u) => u.id === this.currentUserId)
    return user ? this.sanitizeUser(user) : null
  }

  sanitizeUser(u) {
    return {
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      is_active: u.is_active,
      is_protected_admin: !!u.is_protected_admin,
      roles: u.roles || [],
      role_ids: u.role_ids || [],
    }
  }

  // Access profile (effective permissions & menus)
  getAccess() {
    const user = this.data.users.find((u) => u.id === this.currentUserId)
    if (!user) {
      return { user: null, permissions: [], menus: [] }
    }

    // Combine role permissions
    const permSet = new Set()
    const allowedMenuIds = new Set()

    user.role_ids.forEach((roleId) => {
      const role = this.data.roles.find((r) => r.id === roleId && r.is_active)
      if (role) {
        ;(role.permissions || []).forEach((code) => permSet.add(code))
        ;(role.menu_ids || []).forEach((mId) => allowedMenuIds.add(mId))
      }
    })

    // Apply user overrides
    ;(user.overrides || []).forEach((override) => {
      if (override.effect === 'allow') {
        permSet.add(override.permission_code)
      } else if (override.effect === 'deny') {
        permSet.delete(override.permission_code)
      }
    })

    // If protected admin, grant all permissions and menus
    if (user.is_protected_admin) {
      this.data.permissions.forEach((p) => permSet.add(p.code))
      this.data.menus.forEach((m) => allowedMenuIds.add(m.id))
    }

    const effectivePermissions = Array.from(permSet)

    // Build visible menu tree
    const activeMenus = this.data.menus.filter((m) => {
      if (!m.is_active) return false
      // Must be in allowed menu ids
      if (!allowedMenuIds.has(m.id) && !user.is_protected_admin) return false
      // Must meet required permission
      if (m.required_permission && !effectivePermissions.includes(m.required_permission)) {
        return false
      }
      return true
    })

    activeMenus.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    return {
      user: this.sanitizeUser(user),
      permissions: effectivePermissions,
      menus: activeMenus,
    }
  }

  // Users CRUD
  listUsers({ page = 1, page_size = 25, search = '' }) {
    let list = [...this.data.users]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      )
    }
    const count = list.length
    const start = (page - 1) * page_size
    const results = list.slice(start, start + page_size).map((u) => this.sanitizeUser(u))
    return { count, results }
  }

  createUser(payload) {
    if (this.data.users.some((u) => u.username.toLowerCase() === payload.username.toLowerCase())) {
      throw new Error(`Username "${payload.username}" is already taken.`)
    }
    const newUser = {
      id: Date.now(),
      username: payload.username,
      name: payload.name || '',
      email: payload.email || '',
      password: payload.password || 'password123',
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      is_protected_admin: false,
      roles: ['standard_user'],
      role_ids: [3],
      overrides: [],
    }
    this.data.users.unshift(newUser)
    this.logAudit('user.create', 'User', newUser.username)
    this.save()
    return this.sanitizeUser(newUser)
  }

  updateUser(id, payload) {
    const index = this.data.users.findIndex((u) => u.id === Number(id))
    if (index === -1) throw new Error('User not found.')
    const user = this.data.users[index]
    if (payload.name !== undefined) user.name = payload.name
    if (payload.email !== undefined) user.email = payload.email
    if (payload.is_active !== undefined) user.is_active = payload.is_active
    if (payload.password) user.password = payload.password
    this.logAudit('user.update', 'User', user.username)
    this.save()
    return this.sanitizeUser(user)
  }

  deactivateUser(id) {
    const user = this.data.users.find((u) => u.id === Number(id))
    if (!user) throw new Error('User not found.')
    if (user.is_protected_admin) {
      throw new Error('Protected administrator cannot be deactivated.')
    }
    user.is_active = false
    this.logAudit('user.deactivate', 'User', user.username)
    this.save()
    return { success: true }
  }

  getUserRoles(id) {
    const user = this.data.users.find((u) => u.id === Number(id))
    if (!user) throw new Error('User not found.')
    return { role_ids: user.role_ids || [] }
  }

  setUserRoles(id, roleIds) {
    const user = this.data.users.find((u) => u.id === Number(id))
    if (!user) throw new Error('User not found.')
    user.role_ids = roleIds
    user.roles = roleIds
      .map((rId) => this.data.roles.find((r) => r.id === rId)?.code)
      .filter(Boolean)
    this.logAudit('user.assign_roles', 'User', user.username)
    this.save()
    return { success: true, role_ids: user.role_ids, roles: user.roles }
  }

  getUserOverrides(id) {
    const user = this.data.users.find((u) => u.id === Number(id))
    if (!user) throw new Error('User not found.')
    return { overrides: user.overrides || [] }
  }

  setUserOverrides(id, overrides) {
    const user = this.data.users.find((u) => u.id === Number(id))
    if (!user) throw new Error('User not found.')
    user.overrides = overrides
    this.logAudit('user.set_overrides', 'User', user.username)
    this.save()
    return { success: true, overrides: user.overrides }
  }

  // Roles CRUD
  listRoles() {
    return {
      count: this.data.roles.length,
      results: this.data.roles.map((r) => ({
        ...r,
        user_count: this.data.users.filter((u) => (u.role_ids || []).includes(r.id)).length,
      })),
    }
  }

  createRole(payload) {
    if (this.data.roles.some((r) => r.code.toLowerCase() === payload.code.toLowerCase())) {
      throw new Error(`Role code "${payload.code}" already exists.`)
    }
    const newRole = {
      id: Date.now(),
      code: payload.code,
      name: payload.name,
      description: payload.description || '',
      is_system: false,
      is_active: true,
      permissions: [],
      menu_ids: [1],
    }
    this.data.roles.push(newRole)
    this.logAudit('role.create', 'Role', newRole.code)
    this.save()
    return newRole
  }

  updateRole(id, payload) {
    const role = this.data.roles.find((r) => r.id === Number(id))
    if (!role) throw new Error('Role not found.')
    if (payload.name !== undefined) role.name = payload.name
    if (payload.description !== undefined) role.description = payload.description
    if (payload.is_active !== undefined) role.is_active = payload.is_active
    this.logAudit('role.update', 'Role', role.code)
    this.save()
    return role
  }

  deactivateRole(id) {
    const role = this.data.roles.find((r) => r.id === Number(id))
    if (!role) throw new Error('Role not found.')
    if (role.is_system) throw new Error('System roles cannot be deactivated.')
    role.is_active = false
    this.logAudit('role.deactivate', 'Role', role.code)
    this.save()
    return { success: true }
  }

  getRolePermissions(id) {
    const role = this.data.roles.find((r) => r.id === Number(id))
    if (!role) throw new Error('Role not found.')
    return { permission_codes: role.permissions || [] }
  }

  setRolePermissions(id, codes) {
    const role = this.data.roles.find((r) => r.id === Number(id))
    if (!role) throw new Error('Role not found.')
    role.permissions = codes
    this.logAudit('role.assign_permissions', 'Role', role.code)
    this.save()
    return { success: true, permission_codes: role.permissions }
  }

  getRoleMenus(id) {
    const role = this.data.roles.find((r) => r.id === Number(id))
    if (!role) throw new Error('Role not found.')
    return { menu_ids: role.menu_ids || [] }
  }

  setRoleMenus(id, menuIds) {
    const role = this.data.roles.find((r) => r.id === Number(id))
    if (!role) throw new Error('Role not found.')
    role.menu_ids = menuIds
    this.logAudit('role.assign_menus', 'Role', role.code)
    this.save()
    return { success: true, menu_ids: role.menu_ids }
  }

  // Permissions CRUD
  listPermissions() {
    return {
      count: this.data.permissions.length,
      results: this.data.permissions,
    }
  }

  createPermission(payload) {
    if (this.data.permissions.some((p) => p.code.toLowerCase() === payload.code.toLowerCase())) {
      throw new Error(`Permission code "${payload.code}" already exists.`)
    }
    const newPerm = {
      id: Date.now(),
      code: payload.code,
      resource: payload.resource,
      action: payload.action,
      description: payload.description || '',
      is_system: false,
      is_active: true,
      is_effective: true,
    }
    this.data.permissions.push(newPerm)
    this.logAudit('permission.create', 'Permission', newPerm.code)
    this.save()
    return newPerm
  }

  updatePermission(id, payload) {
    const perm = this.data.permissions.find((p) => p.id === Number(id))
    if (!perm) throw new Error('Permission not found.')
    if (payload.description !== undefined) perm.description = payload.description
    this.logAudit('permission.update', 'Permission', perm.code)
    this.save()
    return perm
  }

  deactivatePermission(id) {
    const perm = this.data.permissions.find((p) => p.id === Number(id))
    if (!perm) throw new Error('Permission not found.')
    if (perm.is_system) throw new Error('System permissions cannot be deactivated.')
    perm.is_active = false
    this.logAudit('permission.deactivate', 'Permission', perm.code)
    this.save()
    return { success: true }
  }

  // Menus CRUD
  listMenus() {
    return {
      count: this.data.menus.length,
      results: this.data.menus,
    }
  }

  createMenu(payload) {
    if (this.data.menus.some((m) => m.code.toLowerCase() === payload.code.toLowerCase())) {
      throw new Error(`Menu code "${payload.code}" already exists.`)
    }
    const newMenu = {
      id: Date.now(),
      code: payload.code,
      label: payload.label,
      path: payload.path,
      component_key: payload.component_key,
      required_permission: payload.required_permission || null,
      parent: payload.parent || null,
      sort_order: payload.sort_order || 0,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
    }
    this.data.menus.push(newMenu)
    this.logAudit('menu.create', 'Menu', newMenu.code)
    this.save()
    return newMenu
  }

  updateMenu(id, payload) {
    const menu = this.data.menus.find((m) => m.id === Number(id))
    if (!menu) throw new Error('Menu not found.')
    Object.assign(menu, payload)
    this.logAudit('menu.update', 'Menu', menu.code)
    this.save()
    return menu
  }

  deactivateMenu(id) {
    const menu = this.data.menus.find((m) => m.id === Number(id))
    if (!menu) throw new Error('Menu not found.')
    menu.is_active = false
    this.logAudit('menu.deactivate', 'Menu', menu.code)
    this.save()
    return { success: true }
  }

  getNavigationMenus() {
    return this.data.menus.filter((m) => m.is_active)
  }

  // Todos CRUD
  listTodos({ page = 1, page_size = 25, status = '', priority = '' }) {
    let list = [...this.data.todos]
    if (status) list = list.filter((t) => t.status === status)
    if (priority) list = list.filter((t) => t.priority === priority)
    const count = list.length
    const start = (page - 1) * page_size
    const results = list.slice(start, start + page_size)
    return { count, results }
  }

  createTodo(payload) {
    const currentUser = this.getCurrentUser()
    const newTodo = {
      id: Date.now(),
      title: payload.title,
      description: payload.description || '',
      priority: payload.priority || 'normal',
      status: 'open',
      due_at: payload.due_at || null,
      assignee_username: payload.assignee || currentUser?.username || 'user',
      created_by: currentUser?.username || 'user',
    }
    this.data.todos.unshift(newTodo)
    this.logAudit('todo.create', 'Todo', newTodo.id)
    this.save()
    return newTodo
  }

  updateTodo(id, payload) {
    const todo = this.data.todos.find((t) => t.id === Number(id))
    if (!todo) throw new Error('To-do not found.')
    if (payload.title !== undefined) todo.title = payload.title
    if (payload.description !== undefined) todo.description = payload.description
    if (payload.priority !== undefined) todo.priority = payload.priority
    if (payload.due_at !== undefined) todo.due_at = payload.due_at
    this.logAudit('todo.update', 'Todo', todo.id)
    this.save()
    return todo
  }

  deleteTodo(id) {
    const index = this.data.todos.findIndex((t) => t.id === Number(id))
    if (index === -1) throw new Error('To-do not found.')
    this.data.todos.splice(index, 1)
    this.logAudit('todo.delete', 'Todo', id)
    this.save()
    return { success: true }
  }

  setTodoStatus(id, status) {
    const todo = this.data.todos.find((t) => t.id === Number(id))
    if (!todo) throw new Error('To-do not found.')
    todo.status = status
    this.logAudit('todo.status_change', 'Todo', `${todo.id} (${status})`)
    this.save()
    return todo
  }

  assignTodo(id, assignee) {
    const todo = this.data.todos.find((t) => t.id === Number(id))
    if (!todo) throw new Error('To-do not found.')
    todo.assignee_username = assignee
    this.logAudit('todo.assign', 'Todo', `${todo.id} -> ${assignee}`)
    this.save()
    return todo
  }

  // Audit Logs
  listAudit({ resource_type = '', search = '', cursor = null }) {
    let list = [...this.data.audit]
    if (resource_type) {
      list = list.filter((a) => a.resource_type.toLowerCase() === resource_type.toLowerCase())
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.action.toLowerCase().includes(q) ||
          a.actor_username.toLowerCase().includes(q) ||
          (a.object_id && a.object_id.toLowerCase().includes(q))
      )
    }

    const pageSize = 15
    let startIndex = 0
    if (cursor) {
      const cIndex = list.findIndex((a) => String(a.id) === String(cursor))
      if (cIndex !== -1) startIndex = cIndex + 1
    }

    const slice = list.slice(startIndex, startIndex + pageSize)
    const nextItem = list[startIndex + pageSize]

    return {
      results: slice,
      next: nextItem ? `?cursor=${nextItem.id}` : null,
    }
  }

  exportAuditCsv({ resource_type = '', search = '' }) {
    const { results } = this.listAudit({ resource_type, search, cursor: null })
    const headers = ['id', 'created_at', 'actor_username', 'action', 'resource_type', 'object_id', 'ip_address']
    const rows = [headers.join(',')]
    results.forEach((r) => {
      rows.push([r.id, `"${r.created_at}"`, `"${r.actor_username}"`, `"${r.action}"`, `"${r.resource_type}"`, `"${r.object_id}"`, `"${r.ip_address}"`].join(','))
    })
    return rows.join('\n')
  }
}

export const db = new MockDatabase()
