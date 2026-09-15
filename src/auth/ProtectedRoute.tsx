import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { getAccessToken } from './token'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  const isAuthenticated = user !== null || getAccessToken() !== null

  if (!isAuthenticated) {
    const returnPath = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(returnPath)}`}
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}
