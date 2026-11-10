import { Link } from 'react-router-dom'
import { ParcelMap } from '../components/ParcelMap'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import {
  daysUntilSafetyEnd,
  fertParcelIds,
  formatDate,
  isSafetyActive,
} from '../data/sampleData'

export function Dashboard() {
  const { parcels, records, treatments, openPremium, farmName } = useApp()
  const { user, signOut } = useAuth()
  const totalHa = parcels.reduce((s, p) => s + p.hectares, 0)
  const recent = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const activeSafety = treatments
    .filter(isSafetyActive)
    .map((r) => ({ record: r, days: daysUntilSafetyEnd(r)! }))
    .sort((a, b) => a.days - b.days)

  const pendingSiex = records.filter((r) => !r.sentToSiex).length
  const statusOk = activeSafety.length === 0 && pendingSiex === 0

  return (
    <div className="animate-fade-up">
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand">{farmName}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Buenos días</h1>
            <p className="mt-1 text-sm text-muted">
              {totalHa} ha · plan gratis · cuaderno SIEX
            </p>
            {user?.email && (
              <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="shrink-0 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="px-5">
        <div
          className={`mb-4 rounded-2xl px-4 py-3 ${
            statusOk
              ? 'bg-brand-muted text-ink'
              : activeSafety.length > 0
                ? 'bg-amber-50 text-amber-950'
                : 'bg-sky-50 text-sky-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                statusOk
                  ? 'bg-brand text-white'
                  : activeSafety.length > 0
                    ? 'bg-amber-400 text-white'
                    : 'bg-sky-500 text-white'
              }`}
            >
              {statusOk ? '✓' : '!'}
            </span>
            <div>
              <p className="font-semibold">
                {statusOk
                  ? 'Cumplimiento al día'
                  : activeSafety.length > 0
                    ? `${activeSafety.length} plazo${activeSafety.length > 1 ? 's' : ''} de seguridad activo${activeSafety.length > 1 ? 's' : ''}`
                    : `${pendingSiex} registro${pendingSiex > 1 ? 's' : ''} pendiente${pendingSiex > 1 ? 's' : ''} de SIEX`}
              </p>
              <p className="text-sm opacity-80">
                {statusOk
                  ? 'Tratamientos y fertilizaciones en orden'
                  : activeSafety[0]
                    ? `${activeSafety[0].record.productName}: ${activeSafety[0].days} días restantes`
                    : 'Revisa Informes para marcar el envío'}
              </p>
            </div>
          </div>
        </div>

        <ParcelMap height="h-56" />

        <Link
          to="/registrar"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-light active:scale-[0.99]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" d="M12 6v12M6 12h12" />
          </svg>
          Registrar tratamiento
        </Link>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            to="/parcelas"
            className="rounded-2xl border border-line bg-surface px-4 py-4 transition hover:border-brand/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Acceso rápido</p>
            <p className="mt-1 text-lg font-semibold text-ink">Parcelas</p>
          </Link>
          <Link
            to="/informes"
            className="rounded-2xl border border-line bg-surface px-4 py-4 transition hover:border-brand/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Acceso rápido</p>
            <p className="mt-1 text-lg font-semibold text-ink">Informes</p>
          </Link>
        </div>

        <button
          type="button"
          onClick={() =>
            openPremium('El control de costes y rentabilidad por parcela está incluido en Premium.')
          }
          className="mt-3 w-full rounded-2xl border border-dashed border-brand/40 bg-brand-muted/50 px-4 py-3.5 text-left transition hover:bg-brand-muted"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Premium</p>
          <p className="mt-0.5 font-semibold text-ink">Control de costes</p>
          <p className="text-sm text-muted">Rentabilidad por parcela · 19 €/mes</p>
        </button>
      </div>

      {activeSafety.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="mb-3 text-lg font-semibold text-ink">Plazos de seguridad</h2>
          <ul className="space-y-2">
            {activeSafety.slice(0, 3).map(({ record, days }) => (
              <li
                key={record.id}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <p className="font-semibold text-amber-950">{record.productName}</p>
                <p className="text-sm text-amber-800">
                  {formatDate(record.date)} · {days} día{days === 1 ? '' : 's'} restantes
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">Últimas actividades</h2>
          <Link to="/informes" className="text-sm font-medium text-brand">
            Ver todo
          </Link>
        </div>
        <ul className="space-y-2">
          {recent.map((activity) => {
            if (activity.type === 'tratamiento') {
              const days = daysUntilSafetyEnd(activity)
              const inSafety = days !== null && days >= 0
              const parcelNames = activity.parcelIds
                .map((id) => parcels.find((p) => p.id === id)?.name)
                .filter(Boolean)
                .join(', ')
              return (
                <li
                  key={activity.id}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3.5"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xs font-bold text-brand">
                    FIT
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{activity.productName}</p>
                    <p className="truncate text-sm text-muted">
                      {parcelNames} · {formatDate(activity.date)} · Reg. {activity.registrationNumber}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {inSafety && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Seguridad: {days} d
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          activity.sentToSiex
                            ? 'bg-brand-soft text-brand'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {activity.sentToSiex ? 'Enviado SIEX' : 'Pendiente SIEX'}
                      </span>
                    </div>
                  </div>
                </li>
              )
            }

            const parcelName = fertParcelIds(activity)
              .map((id) => parcels.find((p) => p.id === id)?.name)
              .filter(Boolean)
              .join(', ')
            return (
              <li
                key={activity.id}
                className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3.5"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xs font-bold text-sky-700">
                  FERT
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{activity.fertilizerName}</p>
                  <p className="truncate text-sm text-muted">
                    {parcelName || 'Sin parcela'} · {formatDate(activity.date)} · {activity.dose}{' '}
                    {activity.doseUnit}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      activity.sentToSiex
                        ? 'bg-brand-soft text-brand'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {activity.sentToSiex ? 'Enviado SIEX' : 'Pendiente SIEX'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
