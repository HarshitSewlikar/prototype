// src/features/auth/LoginPage.jsx
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, Input } from '../../components/common/Ui'
import { extractError } from '../../services/http'
import { useAuth } from './AuthProvider'

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md space-y-5">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          <div>
            <h1 className="text-xl font-bold text-slate-800">Financial Analytics Dashboard</h1>
            <p className="mt-1 text-xs text-slate-500">Enter your username and password.</p>
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
            {submitting ? 'Logging in…' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
