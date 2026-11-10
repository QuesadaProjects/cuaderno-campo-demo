import { Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { BottomNav } from './BottomNav'
import { PremiumModal } from './PremiumModal'

export function Layout() {
  const location = useLocation()
  const { ready, loadingError, refreshData } = useApp()
  const hideNav =
    location.pathname.startsWith('/registrar') ||
    location.pathname.startsWith('/fertilizacion')

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 px-5 text-center">
          <div className="h-10 w-10 animate-pulse rounded-full bg-brand/20" />
          <p className="text-sm text-muted">Cargando tu explotación…</p>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center bg-white px-5">
        <div className="w-full max-w-sm rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-semibold text-amber-950">No se pudieron cargar los datos</p>
          <p className="mt-2 text-sm text-amber-900">{loadingError}</p>
          <button
            type="button"
            onClick={() => void refreshData()}
            className="mt-4 w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

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
