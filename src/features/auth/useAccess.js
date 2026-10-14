// src/features/auth/useAccess.js
import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../app/queryClient'
import { getAccess } from '../../services/endpoints'
import { useAuth } from './AuthProvider'

export const useAccess = () => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.authAccess,
    queryFn: getAccess,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export const usePermission = () => {
  const { data } = useAccess()
  const permissions = data?.permissions || []
  return (code) => permissions.includes(code)
}

// Application-wide feature modules. Unknown codes are treated as enabled so
// that transient load states never hide navigation the user is entitled to.
export const useModules = () => {
  const { data } = useAccess()
  const modules = data?.modules || []
  const isModuleEnabled = (code) => {
    if (!code) return true
    if (!modules.length) return true
    const match = modules.find((module) => module.code === code)
    return match ? !!match.is_enabled : true
  }
  return { modules, isModuleEnabled }
}
