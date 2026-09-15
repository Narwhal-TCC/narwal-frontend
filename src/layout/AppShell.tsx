import { Outlet } from 'react-router-dom'
import { waveBg } from '../assets'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-[color:var(--navi-bg)]">
      <Sidebar />
      <main className="relative flex flex-1 flex-col overflow-auto">
        <div className="flex-1">
          <Outlet />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none mt-auto h-[120px] overflow-hidden opacity-40"
        >
          <img src={waveBg} alt="" className="h-full w-full object-cover object-bottom" />
        </div>
      </main>
    </div>
  )
}
