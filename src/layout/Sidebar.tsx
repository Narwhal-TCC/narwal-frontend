import { NavLink, useNavigate } from 'react-router-dom'
import {
  icoGrid,
  icoHistory,
  icoSun,
  icoUpload,
  icoUser,
  naviLogo,
} from '../assets'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'

const navItems = [
  { to: '/', label: 'Visão geral', icon: icoGrid, end: true },
  { to: '/analises/nova', label: 'Nova análise', icon: icoUpload, end: false },
  { to: '/historico', label: 'Histórico', icon: icoHistory, end: false },
] as const

export function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-[color:var(--navi-border)] bg-[color:var(--navi-panel)]">
      <div className="flex items-center gap-2.5 border-b border-[color:var(--navi-border-subtle)] px-5 pb-4 pt-5">
        <img
          src={naviLogo}
          alt=""
          className="size-9 rounded-[18px] object-contain"
        />
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
                  ? 'bg-[color:var(--navi-surface-active)] font-semibold text-[color:var(--navi-link-active)]'
                  : 'font-normal text-[color:var(--navi-link)] hover:bg-[color:var(--navi-surface-tint)]',
              ].join(' ')
            }
          >
            <img src={item.icon} alt="" className="size-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2.5 border-t border-[color:var(--navi-border-subtle)] px-3.5 py-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 rounded-md bg-[color:var(--navi-surface-tint)] px-3 py-1.5 text-[13px] text-[color:var(--navi-link)] hover:bg-[color:var(--navi-surface-active)]"
        >
          <img src={icoSun} alt="" className="size-4" />
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex size-[30px] items-center justify-center rounded-[15px] border border-[color:var(--navi-border-strong)] bg-[color:var(--navi-surface-tint)]">
            <img src={icoUser} alt="" className="size-[18px]" />
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
          className="text-left text-[13px] text-[color:var(--navi-link)] hover:text-[color:var(--navi-text)]"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
