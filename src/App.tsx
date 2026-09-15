import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { getAccessToken } from './auth/token'
import { AppShell } from './layout/AppShell'
import { HistoricoPage } from './pages/HistoricoPage'
import { HomePage } from './pages/HomePage'
import { LoadingPage } from './pages/LoadingPage'
import { LoginPage } from './pages/LoginPage'
import { NovaAnalisePage } from './pages/NovaAnalisePage'
import { ResultadoPage } from './pages/ResultadoPage'

function PublicLoginRoute() {
  if (getAccessToken()) {
    return <Navigate to="/" replace />
  }
  return <LoginPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicLoginRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/analises/nova" element={<NovaAnalisePage />} />
          <Route path="/analises/loading" element={<LoadingPage />} />
          <Route path="/analises/:id" element={<ResultadoPage />} />
          <Route path="/historico" element={<HistoricoPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
