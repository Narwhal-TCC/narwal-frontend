import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'

const navItems = [
  { to: '/', label: 'Visão geral', end: true },
  { to: '/analises/nova', label: 'Nova análise', end: false },
  { to: '/historico', label: 'Histórico', end: false },
] as const

function NavIcon({ name }: { name: 'grid' | 'upload' | 'history' }) {
  if (name === 'grid') {
    return (
      <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden="true">
        <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="10" y="10" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
    )
  }
  if (name === 'upload') {
    return (
      <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden="true">
        <path
          d="M9 3v8M5.5 6.5 9 3l3.5 3.5M4 13h10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 5.5V9l2.5 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function navIconName(path: string): 'grid' | 'upload' | 'history' {
  if (path === '/') return 'grid'
  if (path.startsWith('/analises')) return 'upload'
  return 'history'
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-[color:var(--navi-border)] bg-[#1c2654]">
      <div className="flex items-center gap-2.5 border-b border-[color:var(--navi-border)] px-5 pb-4 pt-5">
        <div className="flex size-9 items-center justify-center rounded-[18px] bg-[var(--navi-accent)] text-sm font-semibold text-white">
          N
        </div>
        <div>
          <p className="font-serif text-xl leading-5 text-[color:var(--navi-text)]">Navi</p>
          <p className="pt-0.5 text-[9px] font-medium uppercase tracking-[0.54px] text-[color:var(--navi-muted)]">
            Análise de Sonar
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2.5 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[rgba(111,156,235,0.22)] font-semibold text-[#6f9ceb]'
                  : 'font-normal text-[#98b9f2] hover:bg-[rgba(111,156,235,0.12)]',
              ].join(' ')
            }
          >
            <NavIcon name={navIconName(item.to)} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2.5 border-t border-[color:var(--navi-border)] px-3.5 py-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 rounded-md bg-[rgba(111,156,235,0.12)] px-3 py-1.5 text-[13px] text-[#98b9f2] hover:bg-[rgba(111,156,235,0.18)]"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
            <circle cx="8" cy="8" r="3.5" stroke="currentColor" fill="none" strokeWidth="1.2" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex size-[30px] items-center justify-center rounded-[15px] border border-[rgba(111,156,235,0.25)] bg-[rgba(111,156,235,0.12)]">
            <svg viewBox="0 0 18 18" className="size-[18px] text-[#98b9f2]" aria-hidden="true">
              <circle cx="9" cy="6" r="3" fill="currentColor" />
              <path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[color:var(--navi-text)]">
              {user?.user_id ?? 'Operador'}
            </p>
            <p className="font-mono text-[10px] text-[color:var(--navi-muted)]">CIAGA · v2.4</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="text-left text-[13px] text-[#98b9f2] hover:text-[color:var(--navi-text)]"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
