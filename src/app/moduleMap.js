// src/app/moduleMap.js
// Maps navigation menu codes to the feature module that owns them.
// `null` means the menu is core administration and always available.
export const MENU_MODULE = {
  dashboard: 'market',
  todos: 'todos',
  users: 'users',
  roles: 'roles_permissions',
  permissions: 'roles_permissions',
  menus: null,
  modules: null,
  audit: 'audit',
}

export const moduleForMenu = (code) => MENU_MODULE[code] ?? null
