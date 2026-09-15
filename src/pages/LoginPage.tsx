import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { naviLogo } from '../assets'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'

const REQUIRED_FIELDS_ERROR = 'Preencha os campos obrigatórios.'
const INVALID_CREDENTIALS_ERROR = 'Credenciais inválidas.'

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError(REQUIRED_FIELDS_ERROR)
      return
    }

    setIsSubmitting(true)
    try {
      await login(username.trim(), password)
      const next = searchParams.get('next')
      navigate(next && next.startsWith('/') ? next : '/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') {
        setError(INVALID_CREDENTIALS_ERROR)
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(INVALID_CREDENTIALS_ERROR)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[color:var(--navi-bg)]">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        className="absolute right-5 top-5 rounded-md border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-surface-tint)] p-1.5 text-[color:var(--navi-link)]"
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" fill="none" strokeWidth="1.2" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-9 flex flex-col items-center gap-2.5">
          <img src={naviLogo} alt="" className="size-20 rounded-full object-contain" />
          <h1 className="font-serif text-[34px] leading-[34px] text-[color:var(--navi-text)]">Navi</h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]">
            Plataforma de análise de sonar
          </p>
        </div>

        <div className="w-full max-w-[360px] rounded-[10px] border border-[color:var(--navi-border-subtle)] bg-[color:var(--navi-card)] px-7 pb-6 pt-7 shadow-[0px_2px_8px_rgba(0,0,0,0.12)]">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]"
              >
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Identificação"
                autoComplete="username"
                className="w-full rounded-md border border-[color:var(--navi-border-strong)] bg-[color:var(--navi-input-bg)] px-3 py-2.5 font-mono text-sm text-[color:var(--navi-text)] placeholder:text-[color:var(--navi-muted)]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.66px] text-[color:var(--navi-muted)]"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-md border border-[color:var(--navi-border-strong)] bg-[color:var(--navi-input-bg)] px-3 py-2.5 font-mono text-sm text-[color:var(--navi-text)] placeholder:text-[color:var(--navi-muted)]"
              />
            </div>

            {error ? (
              <p role="alert" className="text-[13px] text-[color:var(--navi-milco)]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md bg-[var(--navi-accent)] px-5 py-2.5 text-sm font-semibold text-[color:var(--navi-button-text)] disabled:opacity-70"
            >
              Entrar
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-[color:var(--navi-muted)]">
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  )
}
