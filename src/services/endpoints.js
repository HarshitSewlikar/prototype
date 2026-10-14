// Client-side API endpoints connecting to the in-browser RBAC database & market engine
import { db } from './mockDatabase'
import { getMockDailyStockData, getMockMarketMovers, getMockSectorPerformance } from '../utils/mockMarketData'
import { calculateStockScore } from '../utils/stockScoreCalculator'

// Simulate realistic async network delay
const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Auth ---
export const getSetupStatus = async () => {
  await delay(30)
  return db.getSetupStatus()
}

export const bootstrap = async (payload) => {
  await delay(80)
  return db.bootstrap(payload)
}

export const login = async (payload) => {
  await delay(80)
  return db.login(payload.username, payload.password)
}

export const switchUser = async (username) => {
  await delay(50)
  return db.switchUser(username)
}

export const logout = async () => {
  await delay(30)
  return db.logout()
}

export const getMe = async () => {
  await delay(30)
  const user = db.getCurrentUser()
  if (!user) throw new Error('Unauthenticated')
  return { user }
}

export const getAccess = async () => {
  await delay(40)
  return db.getAccess()
}

// --- Users ---
export const listUsers = async (params = {}) => {
  await delay(50)
  return db.listUsers(params)
}

export const createUser = async (payload) => {
  await delay(70)
  return db.createUser(payload)
}

export const updateUser = async (id, payload) => {
  await delay(60)
  return db.updateUser(id, payload)
}

export const deactivateUser = async (id) => {
  await delay(50)
  return db.deactivateUser(id)
}

export const getUserRoles = async (id) => {
  await delay(40)
  return db.getUserRoles(id)
}

export const setUserRoles = async (id, roleIds) => {
  await delay(60)
  return db.setUserRoles(id, roleIds)
}

export const getUserOverrides = async (id) => {
  await delay(40)
  return db.getUserOverrides(id)
}

export const setUserOverrides = async (id, overrides) => {
  await delay(60)
  return db.setUserOverrides(id, overrides)
}

// --- Roles ---
export const listRoles = async (params = {}) => {
  await delay(40)
  return db.listRoles(params)
}

export const createRole = async (payload) => {
  await delay(60)
  return db.createRole(payload)
}

export const updateRole = async (id, payload) => {
  await delay(50)
  return db.updateRole(id, payload)
}

export const deactivateRole = async (id) => {
  await delay(50)
  return db.deactivateRole(id)
}

export const getRolePermissions = async (id) => {
  await delay(40)
  return db.getRolePermissions(id)
}

export const setRolePermissions = async (id, codes) => {
  await delay(60)
  return db.setRolePermissions(id, codes)
}

export const getRoleMenus = async (id) => {
  await delay(40)
  return db.getRoleMenus(id)
}

export const setRoleMenus = async (id, menuIds) => {
  await delay(60)
  return db.setRoleMenus(id, menuIds)
}

// --- Permissions ---
export const listPermissions = async (params = {}) => {
  await delay(30)
  return db.listPermissions(params)
}

export const createPermission = async (payload) => {
  await delay(60)
  return db.createPermission(payload)
}

export const updatePermission = async (id, payload) => {
  await delay(50)
  return db.updatePermission(id, payload)
}

export const deactivatePermission = async (id) => {
  await delay(50)
  return db.deactivatePermission(id)
}

// --- Menus ---
export const listMenus = async (params = {}) => {
  await delay(30)
  return db.listMenus(params)
}

export const createMenu = async (payload) => {
  await delay(60)
  return db.createMenu(payload)
}

export const updateMenu = async (id, payload) => {
  await delay(50)
  return db.updateMenu(id, payload)
}

export const deactivateMenu = async (id) => {
  await delay(50)
  return db.deactivateMenu(id)
}

export const getNavigationMenus = async () => {
  await delay(30)
  return db.getNavigationMenus()
}

// --- Todos ---
export const listTodos = async (params = {}) => {
  await delay(40)
  return db.listTodos(params)
}

export const createTodo = async (payload) => {
  await delay(60)
  return db.createTodo(payload)
}

export const updateTodo = async (id, payload) => {
  await delay(50)
  return db.updateTodo(id, payload)
}

export const deleteTodo = async (id) => {
  await delay(50)
  return db.deleteTodo(id)
}

export const assignTodo = async (id, assignee) => {
  await delay(50)
  return db.assignTodo(id, assignee)
}

export const setTodoStatus = async (id, status) => {
  await delay(50)
  return db.setTodoStatus(id, status)
}

// --- Audit ---
export const listAudit = async (params = {}) => {
  await delay(40)
  return db.listAudit(params)
}

export const exportAuditCsv = async (params = {}) => {
  await delay(40)
  return db.exportAuditCsv(params)
}

// --- Market ---
export const getDailyStock = async (symbol) => {
  await delay(60)
  const data = getMockDailyStockData(symbol)
  return {
    data,
    source: 'mock',
  }
}

export const getSectors = async () => {
  await delay(50)
  const data = getMockSectorPerformance()
  return {
    data,
    source: 'mock',
  }
}

export const getMovers = async () => {
  await delay(50)
  const data = getMockMarketMovers()
  return {
    data,
    source: 'mock',
  }
}

export const getStockScore = async (symbol) => {
  await delay(60)
  const dailyData = getMockDailyStockData(symbol)
  const scoreData = calculateStockScore(dailyData)
  return {
    data: scoreData,
    source: 'mock',
  }
}
