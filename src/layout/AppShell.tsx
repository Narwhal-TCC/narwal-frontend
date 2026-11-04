import { Outlet, useMatch } from 'react-router-dom'
import { waveBg } from '../assets'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const isCampaignDetail = Boolean(useMatch({ path: '/campaigns/:id', end: true }))

  return (
    <div
      className={[
        'flex bg-[color:var(--navi-bg)]',
        isCampaignDetail ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen',
      ].join(' ')}
    >
      <Sidebar />
      <main
        className={[
          'relative flex min-h-0 flex-1 flex-col',
          isCampaignDetail ? 'overflow-hidden' : 'overflow-auto',
        ].join(' ')}
      >
        <div
          className={
            isCampaignDetail
              ? 'flex h-full min-h-0 flex-col'
              : 'flex-1'
          }
        >
          <Outlet />
        </div>
        {!isCampaignDetail ? (
          <div
            aria-hidden="true"
            className="pointer-events-none mt-auto h-[260px] overflow-hidden"
          >
            <img
              src={waveBg}
              alt=""
              className="h-full w-full object-cover object-bottom"
            />
          </div>
        ) : null}
      </main>
    </div>
  )
}
