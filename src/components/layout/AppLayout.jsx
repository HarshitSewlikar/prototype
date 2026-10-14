// src/components/layout/AppLayout.jsx
import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { 
  BarChart3, 
  CheckSquare, 
  Users, 
  ShieldCheck, 
  Key, 
  Menu as MenuIcon, 
  FileText, 
  LogOut,
  TrendingUp,
  Activity,
  SlidersHorizontal
} from 'lucide-react'

import { useAuth } from '../../features/auth/AuthProvider'
import { useAccess } from '../../features/auth/useAccess'
import { Button } from '../common/Ui'

const ICON_MAP = {
  dashboard: BarChart3,
  todos: CheckSquare,
  users: Users,
  roles: ShieldCheck,
  permissions: Key,
  menus: MenuIcon,
  modules: SlidersHorizontal,
  audit: FileText,
}

const navClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition-all ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
  }`

const AppLayout = () => {
  const { user, logout } = useAuth()
  const { data } = useAccess()
  const navigate = useNavigate()
  const menus = data?.menus || []

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Sidebar - UI/UX Pro Max Dark Slate Theme */}
      <aside className="w-64 shrink-0 bg-[#090d16] flex flex-col justify-between border-r border-slate-800/80">
        <div className="p-4">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-5 border-b border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Apex Financial
              </h1>
              <span className="text-[11px] font-medium text-slate-400">Enterprise Intelligence</span>
            </div>
          </div>

          <div className="mb-2 px-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Workspace Menus
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
              RBAC
            </span>
          </div>

          <nav className="space-y-1">
            {menus.map((menu) => {
              const IconComponent = ICON_MAP[menu.code] || Activity
              return (
                <div key={menu.code}>
                  <NavLink to={menu.path} className={navClass} end>
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{menu.label}</span>
                  </NavLink>
                  {menu.children?.map((child) => (
                    <NavLink
                      key={child.code}
                      to={child.path}
                      className={({ isActive }) => `${navClass({ isActive })} ml-5 text-[11px]`}
                    >
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Bottom */}
        <div className="p-3.5 m-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || user?.username}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="truncate">Role: <span className="text-blue-400 font-medium">{user?.roles?.[0] || 'user'}</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Signed in
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-6 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session:</span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {user?.username}
              {user?.is_protected_admin && (
                <span className="text-blue-600 font-medium text-[10px] px-1 bg-blue-50 rounded">Super Admin</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Authenticated session
            </div>

            <Button variant="secondary" className="text-xs py-1 px-2.5" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
