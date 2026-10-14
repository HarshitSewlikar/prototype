// src/features/auth/LoginPage.jsx
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, Input } from '../../components/common/Ui'
import { extractError } from '../../services/http'
import { useAuth } from './AuthProvider'

const DEMO_ACCOUNTS = [
  { username: 'admin', role: 'Administrator', desc: 'Full access (Admin, RBAC, To-dos, Market)' },
  { username: 'auditor', role: 'Auditor', desc: 'Read-only audit trail & market data' },
  { username: 'user', role: 'Finance Analyst', desc: 'Scoped to-dos and market analytics' },
]

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(form.username, form.password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const fillAndLogin = async (username) => {
    setForm({ username, password: 'password123' })
    setError(null)
    setSubmitting(true)
    try {
      await login(username, 'password123')
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md space-y-5">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          <div>
            <h1 className="text-xl font-bold text-slate-800">Financial Analytics Dashboard</h1>
            <p className="mt-1 text-xs text-slate-500">
              Sign in with your credentials or select a demo account below.
            </p>
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Input
            label="Username"
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={onChange}
            placeholder="e.g. admin"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            required
          />

          <Button type="submit" disabled={submitting} className="w-full py-2">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick Demo Accounts
            </span>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => fillAndLogin(acc.username)}
                  className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{acc.username}</span>
                    <span className="ml-1.5 text-slate-500">({acc.role})</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{acc.desc}</p>
                  </div>
                  <span className="text-blue-600 font-medium">Log in →</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
