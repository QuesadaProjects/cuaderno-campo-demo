import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { PremiumModal } from './PremiumModal'

export function Layout() {
  const location = useLocation()
  const hideNav =
    location.pathname.startsWith('/registrar') ||
    location.pathname.startsWith('/fertilizacion')

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-white shadow-[0_0_60px_rgba(15,23,42,0.04)]">
      <main className={hideNav ? 'pb-6' : 'pb-24'}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
      <PremiumModal />
    </div>
  )
}
