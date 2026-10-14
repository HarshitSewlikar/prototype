// src/services/http.js
// Real axios client for the Django REST Framework API.
// - Access token is held in memory only (never localStorage).
// - Session is restored via the HttpOnly refresh cookie.
// - CSRF token is read from the `csrftoken` cookie and sent on unsafe methods.
import axios from 'axios'

let accessToken = null
let authLostHandler = null

export const setAccessToken = (token) => {
  accessToken = token || null
}

export const getAccessToken = () => accessToken

export const setAuthLostHandler = (handler) => {
  authLostHandler = handler
}

const readCookie = (name) => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp('(^|;\\s*)' + name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)'),
  )
  return match ? decodeURIComponent(match[2]) : null
}

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

export const ensureCsrfCookie = async () => {
  await api.get('/auth/csrf/')
}

let refreshPromise = null

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    await ensureCsrfCookie().catch(() => {})
    const csrf = readCookie('csrftoken')
    const response = await api.post(
      '/auth/token/refresh/',
      {},
      csrf ? { headers: { 'X-CSRFToken': csrf } } : undefined,
    )
    setAccessToken(response.data.access)
    return response.data.access
  })().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  const method = (config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrf = readCookie('csrftoken')
    if (csrf) config.headers['X-CSRFToken'] = csrf
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const isRefreshEndpoint = config?.url?.includes('/auth/token/refresh/')
    const isAuthEndpoint = config?.url && config.url.startsWith('/auth/')
    if (response?.status === 401 && config && !config.__retried && !isAuthEndpoint) {
      config.__retried = true
      try {
        await refreshAccessToken()
        return api(config)
      } catch (refreshError) {
        setAccessToken(null)
        if (authLostHandler) authLostHandler()
        return Promise.reject(refreshError)
      }
    }
    if (response?.status === 401 && config && !config.__retried && isAuthEndpoint && !refreshPromise) {
      // Access-token-authenticated auth calls (e.g. /auth/me/) may still retry once.
    }
    return Promise.reject(error)
  },
)

export const extractError = (error) => {
  if (!error) return 'An unexpected error occurred.'
  if (typeof error === 'string') return error
  const data = error?.response?.data
  const detail = data?.error?.detail ?? data?.detail ?? error?.message
  if (detail && typeof detail === 'object') {
    return Object.entries(detail)
      .map(([field, messages]) => {
        const text = Array.isArray(messages) ? messages.join(' ') : String(messages)
        return field === 'non_field_errors' ? text : `${field}: ${text}`
      })
      .join(' ')
  }
  return detail || 'Request failed'
}

export const setAuthLostHandlerRef = setAuthLostHandler
