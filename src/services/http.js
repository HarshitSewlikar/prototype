// src/services/http.js
let accessToken = null
let authLostHandler = null

export const setAccessToken = (token) => {
  accessToken = token || null
}

export const getAccessToken = () => accessToken

export const setAuthLostHandler = (handler) => {
  authLostHandler = handler
}

export const ensureCsrfCookie = async () => true

export const refreshAccessToken = async () => accessToken

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

export const http = {
  defaults: {
    baseURL: '/api/v1',
  },
  get: async () => ({ data: {} }),
  post: async () => ({ data: {} }),
}
