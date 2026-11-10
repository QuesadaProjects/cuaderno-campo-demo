import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  FARM_NAME,
  formatDate,
  methodLabel,
} from '../data/sampleData'
import { exportReadablePdf, exportSiexCsv, exportSiexJson } from '../lib/export'

export function Reports() {
  const { records, parcels, markSentToSiex, treatments, fertilizations } = useApp()
  const [generated, setGenerated] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const pending = useMemo(() => records.filter((r) => !r.sentToSiex), [records])
  const sent = useMemo(() => records.filter((r) => r.sentToSiex), [records])
  const totalHa = parcels.reduce((s, p) => s + p.hectares, 0)

  const preview = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const markSelected = () => {
    if (selected.length === 0) {
      window.alert('Selecciona al menos un registro pendiente.')
      return
    }
    markSentToSiex(selected)
    setSelected([])
  }

  const markAllPending = () => {
    markSentToSiex(pending.map((r) => r.id))
    setSelected([])
  }

  return (
    <div className="animate-fade-up px-5 pt-6 pb-4">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Informes</h1>
        <p className="mt-1 text-sm text-muted">
          Cuaderno oficial y exportación estructurada compatible con SIEX (demo)
        </p>
      </header>

      <div className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-surface px-2 py-3">
          <p className="text-lg font-semibold text-ink">{treatments.length}</p>
          <p className="text-xs text-muted">fitosanitarios</p>
        </div>
        <div className="rounded-2xl bg-surface px-2 py-3">
          <p className="text-lg font-semibold text-ink">{fertilizations.length}</p>
          <p className="text-xs text-muted">fertilizaciones</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-2 py-3">
          <p className="text-lg font-semibold text-amber-900">{pending.length}</p>
          <p className="text-xs text-amber-800">pend. SIEX</p>
        </div>
      </div>

      {!generated ? (
        <div className="rounded-3xl border border-line bg-gradient-to-b from-brand-muted to-white p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h7l4 4v12H7V4Z" />
              <path strokeLinecap="round" d="M10 12h4M10 16h4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-ink">Generar cuaderno oficial</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Incluye tratamientos y fertilizaciones de {parcels.length} parcelas ({totalHa} ha) con
            campos requeridos para el registro electrónico.
          </p>
          <button
            type="button"
            onClick={() => setGenerated(true)}
            className="mt-6 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-lg shadow-brand/20"
          >
            Generar vista previa
          </button>
        </div>
      ) : (
        <div className="animate-fade-up space-y-5">
          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Previsualización
                </p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{FARM_NAME}</h2>
                <p className="text-sm text-muted">
                  {records.length} registros · {sent.length} enviados a SIEX
                </p>
              </div>
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                Listo
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface text-[10px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-2 py-2.5 font-medium">Fecha</th>
                    <th className="px-2 py-2.5 font-medium">Tipo</th>
                    <th className="px-2 py-2.5 font-medium">Producto</th>
                    <th className="px-2 py-2.5 font-medium">SIEX</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((a) => (
                    <tr key={a.id} className="border-t border-line">
                      <td className="px-2 py-2 whitespace-nowrap text-slate-600">
                        {formatDate(a.date)}
                      </td>
                      <td className="px-2 py-2">
                        {a.type === 'tratamiento' ? 'FIT' : 'FERT'}
                      </td>
                      <td className="px-2 py-2 text-ink">
                        {a.type === 'tratamiento' ? a.productName : a.fertilizerName}
                        {a.type === 'tratamiento' && (
                          <span className="block text-[10px] text-muted">
                            {a.dose} {a.doseUnit} · {methodLabel(a.applicationMethod)}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {a.sentToSiex ? (
                          <span className="text-brand">Sí</span>
                        ) : (
                          <span className="text-amber-700">Pend.</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => exportReadablePdf(records, parcels)}
              className="rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white"
            >
              Descargar PDF legible
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportSiexCsv(records, parcels)}
                className="rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={() => exportSiexJson(records, parcels)}
                className="rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink"
              >
                Exportar JSON SIEX
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGenerated(false)}
            className="w-full py-2 text-sm font-medium text-muted"
          >
            Cerrar vista previa
          </button>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink">Estado SIEX</h2>
          {pending.length > 0 && (
            <button
              type="button"
              onClick={markAllPending}
              className="text-sm font-medium text-brand"
            >
              Marcar todos
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="rounded-2xl bg-brand-muted px-4 py-3 text-sm text-ink">
            Todos los registros están marcados como enviados a SIEX.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {pending.map((r) => (
                <li key={r.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                      className="mt-1 accent-brand"
                    />
                    <div>
                      <p className="font-semibold text-ink">
                        {r.type === 'tratamiento' ? r.productName : r.fertilizerName}
                      </p>
                      <p className="text-sm text-muted">
                        {formatDate(r.date)} · {r.type === 'tratamiento' ? 'Fitosanitario' : 'Fertilización'}
                        {r.type === 'tratamiento' ? ` · Reg. ${r.registrationNumber}` : ''}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={markSelected}
              className="mt-3 w-full rounded-2xl border border-brand/30 bg-brand-muted py-3.5 text-sm font-semibold text-brand"
            >
              Marcar seleccionados como enviados a SIEX
            </button>
          </>
        )}
      </section>
    </div>
  )
}
