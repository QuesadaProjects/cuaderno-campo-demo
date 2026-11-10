import { Link, useParams } from 'react-router-dom'
import { ParcelMap } from '../components/ParcelMap'
import { useApp } from '../context/AppContext'
import {
  daysUntilSafetyEnd,
  fertParcelIds,
  formatDate,
  formatDateTime,
  isSafetyActive,
  methodLabel,
} from '../data/sampleData'
import { exportReadablePdf, exportSiexCsv, exportSiexJson } from '../lib/export'

export function ParcelDetail() {
  const { id } = useParams()
  const { records, getParcelById, parcels } = useApp()
  const parcel = getParcelById(id ?? '')

  if (!parcel) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-muted">Parcela no encontrada</p>
        <Link to="/parcelas" className="mt-3 inline-block font-medium text-brand">
          Volver a parcelas
        </Link>
      </div>
    )
  }

  const history = records
    .filter((a) =>
      a.type === 'tratamiento'
        ? a.parcelIds.includes(parcel.id)
        : fertParcelIds(a).includes(parcel.id),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="animate-fade-up">
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Link
          to="/parcelas"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-slate-600"
          aria-label="Volver"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5 7 10l5.5 5.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{parcel.name}</h1>
          <p className="text-sm text-muted">
            {parcel.crop} · {parcel.hectares} ha
            {parcel.sigpacRef ? ` · ${parcel.sigpacRef}` : ''}
          </p>
        </div>
      </header>

      <div className="px-5">
        <ParcelMap highlightId={parcel.id} height="h-44" interactive={false} />

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-surface px-2 py-3">
            <p className="text-lg font-semibold text-ink">{parcel.hectares}</p>
            <p className="text-xs text-muted">hectáreas</p>
          </div>
          <div className="rounded-2xl bg-surface px-2 py-3">
            <p className="text-lg font-semibold text-ink">{history.length}</p>
            <p className="text-xs text-muted">registros</p>
          </div>
          <div className="rounded-2xl bg-surface px-2 py-3">
            <p className="truncate text-lg font-semibold text-ink">{parcel.crop}</p>
            <p className="text-xs text-muted">cultivo</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => exportReadablePdf(records, parcels, { parcelId: parcel.id, title: `Informe — ${parcel.name}` })}
            className="rounded-2xl bg-brand py-3 text-xs font-semibold text-white"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => exportSiexCsv(records, parcels, parcel.id)}
            className="rounded-2xl border border-line bg-surface py-3 text-xs font-semibold text-ink"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={() => exportSiexJson(records, parcels, parcel.id)}
            className="rounded-2xl border border-line bg-surface py-3 text-xs font-semibold text-ink"
          >
            JSON SIEX
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            to="/registrar/tratamiento"
            state={{ parcelId: parcel.id }}
            className="rounded-2xl bg-brand-muted py-3 text-center text-sm font-semibold text-brand"
          >
            + Tratamiento
          </Link>
          <Link
            to="/registrar/fertilizacion"
            state={{ parcelId: parcel.id }}
            className="rounded-2xl bg-sky-50 py-3 text-center text-sm font-semibold text-sky-700"
          >
            + Fertilización
          </Link>
        </div>
      </div>

      <section className="mt-8 px-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">Historial inalterable</h2>
          <p className="text-xs text-muted">Solo lectura</p>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay registros en esta parcela.</p>
        ) : (
          <ol className="relative ml-3 space-y-0 border-l-2 border-brand-soft">
            {history.map((activity) => {
              if (activity.type === 'tratamiento') {
                const days = daysUntilSafetyEnd(activity)
                const inSafety = isSafetyActive(activity)
                return (
                  <li key={activity.id} className="relative pb-6 pl-6 last:pb-0">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-brand" />
                    <p className="text-xs font-medium text-muted">
                      {formatDate(activity.date)} · alta {formatDateTime(activity.createdAt)}
                    </p>
                    <p className="mt-0.5 font-semibold text-ink">{activity.productName}</p>
                    <p className="text-sm text-muted">
                      Reg. {activity.registrationNumber} · {activity.activeIngredient}
                    </p>
                    <p className="text-sm text-muted">
                      {activity.dose} {activity.doseUnit} · {activity.treatedAreaHa} ha ·{' '}
                      {methodLabel(activity.applicationMethod)} · {activity.applicator}
                    </p>
                    {activity.notes && (
                      <p className="mt-1 text-sm text-slate-600">{activity.notes}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {inSafety && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          Seguridad: {days} d
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
              }

              return (
                <li key={activity.id} className="relative pb-6 pl-6 last:pb-0">
                  <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-sky-400" />
                  <p className="text-xs font-medium text-muted">
                    {formatDate(activity.date)} · alta {formatDateTime(activity.createdAt)}
                  </p>
                  <p className="mt-0.5 font-semibold text-ink">{activity.fertilizerName}</p>
                  <p className="text-sm text-muted">
                    {activity.fertilizerType} · {activity.dose} {activity.doseUnit}
                    {(activity.n != null || activity.p != null || activity.k != null) &&
                      ` · N${activity.n ?? '—'} P${activity.p ?? '—'} K${activity.k ?? '—'}`}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      activity.sentToSiex
                        ? 'bg-brand-soft text-brand'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {activity.sentToSiex ? 'Enviado SIEX' : 'Pendiente SIEX'}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
