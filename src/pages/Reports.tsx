import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  fertParcelIds,
  formatDate,
  methodLabel,
} from '../data/sampleData'
import { exportReadablePdf, exportSiexCsv, exportSiexJson } from '../lib/export'

type ExportKind = 'pdf' | 'csv' | 'json' | null

export function Reports() {
  const { records, parcels, markSentToSiex, treatments, fertilizations, farmName } = useApp()
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [exporting, setExporting] = useState<ExportKind>(null)
  const [siexToast, setSiexToast] = useState<{ message: string; tone: 'ok' | 'error' } | null>(
    null,
  )
  const [marking, setMarking] = useState(false)

  const pending = useMemo(() => records.filter((r) => !r.sentToSiex), [records])
  const sent = useMemo(() => records.filter((r) => r.sentToSiex), [records])
  const totalHa = parcels.reduce((s, p) => s + p.hectares, 0)

  const preview = [...records].sort((a, b) => b.date.localeCompare(a.date))

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const showToast = (message: string, tone: 'ok' | 'error' = 'ok') => {
    setSiexToast({ message, tone })
    window.setTimeout(() => setSiexToast(null), tone === 'error' ? 6000 : 3200)
  }

  const markSelected = async () => {
    if (selected.length === 0) {
      showToast('Selecciona al menos un registro pendiente.', 'error')
      return
    }
    if (marking) return
    setMarking(true)
    try {
      const count = selected.length
      await markSentToSiex(selected)
      setSelected([])
      showToast(
        count === 1
          ? 'Registro marcado como enviado a SIEX.'
          : `${count} registros marcados como enviados a SIEX.`,
        'ok',
      )
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'No se pudo marcar como enviado a SIEX',
        'error',
      )
    } finally {
      setMarking(false)
    }
  }

  const markAllPending = async () => {
    if (pending.length === 0 || marking) return
    setMarking(true)
    try {
      const count = pending.length
      await markSentToSiex(pending.map((r) => r.id))
      setSelected([])
      showToast(
        count === 1
          ? 'Registro marcado como enviado a SIEX.'
          : `${count} registros marcados como enviados a SIEX.`,
        'ok',
      )
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'No se pudo marcar como enviado a SIEX',
        'error',
      )
    } finally {
      setMarking(false)
    }
  }

  const handleGenerate = () => {
    setGenerating(true)
    window.setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 450)
  }

  const runExport = (kind: Exclude<ExportKind, null>) => {
    setExporting(kind)
    window.setTimeout(() => {
      const farm = { nombre: farmName, nif: '' }
      if (kind === 'pdf') exportReadablePdf(records, parcels, { farm })
      if (kind === 'csv') exportSiexCsv(records, parcels, { farm })
      if (kind === 'json') exportSiexJson(records, parcels, { farm })
      setExporting(null)
      showToast(
        kind === 'pdf'
          ? 'Vista de impresión abierta. Usa “Guardar como PDF” en el navegador.'
          : `Archivo ${kind.toUpperCase()} descargado.`,
      )
    }, 400)
  }

  return (
    <div className="animate-fade-up px-5 pt-6 pb-4">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Informes</h1>
        <p className="mt-1 text-sm text-muted">
          Cuaderno oficial y exportación estructurada compatible con SIEX
        </p>
      </header>

      {siexToast && (
        <div
          role="status"
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            siexToast.tone === 'error'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-brand/20 bg-brand-muted text-ink'
          }`}
        >
          {siexToast.message}
        </div>
      )}

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

      <section className="mb-8 rounded-3xl border-2 border-brand/30 bg-brand-muted/70 p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Paso recomendado</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Marcar como enviado a SIEX</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Cuando hayas comunicado un registro al sistema oficial, márcalo aquí. El historial no se
              borra ni se modifica: solo cambia el estado a «enviado».
            </p>
          </div>
          {pending.length > 0 && (
            <button
              type="button"
              disabled={marking}
              onClick={() => void markAllPending()}
              className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand shadow-sm disabled:opacity-60"
            >
              {marking ? 'Guardando…' : `Marcar todos (${pending.length})`}
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-ink">
            Todo al día: no hay registros pendientes de marcar como enviados a SIEX.
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm font-medium text-ink">
              {pending.length} pendiente{pending.length > 1 ? 's' : ''} · marca los que ya hayas
              enviado
            </p>
            <ul className="space-y-2">
              {pending.map((r) => {
                const parcelsLabel =
                  r.type === 'tratamiento'
                    ? r.parcelIds.map((id) => parcels.find((p) => p.id === id)?.name).join(', ')
                    : fertParcelIds(r)
                        .map((id) => parcels.find((p) => p.id === id)?.name)
                        .join(', ')
                return (
                  <li key={r.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={() => toggle(r.id)}
                        className="mt-1 h-4 w-4 accent-brand"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">
                          {r.type === 'tratamiento' ? r.productName : r.fertilizerName}
                        </p>
                        <p className="text-sm text-muted">
                          {formatDate(r.date)} ·{' '}
                          {r.type === 'tratamiento' ? 'Fitosanitario' : 'Fertilización'} ·{' '}
                          {parcelsLabel || 'Sin parcela'}
                          {r.type === 'tratamiento' ? ` · Reg. ${r.registrationNumber}` : ''}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Pendiente
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              disabled={marking}
              onClick={() => void markSelected()}
              className="mt-4 w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md shadow-brand/20 disabled:opacity-60"
            >
              {marking
                ? 'Guardando en Supabase…'
                : selected.length > 0
                  ? `Marcar ${selected.length} como enviado${selected.length > 1 ? 's' : ''} a SIEX`
                  : 'Marcar seleccionados como enviados a SIEX'}
            </button>
          </>
        )}
      </section>

      {!generated ? (
        <div className="rounded-3xl border border-line bg-gradient-to-b from-white to-surface p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h7l4 4v12H7V4Z" />
              <path strokeLinecap="round" d="M10 12h4M10 16h4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-ink">Generar cuaderno oficial</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Incluye tratamientos y fertilizaciones de {parcels.length} parcelas ({totalHa} ha) con
            los campos del registro electrónico.
          </p>
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="mt-6 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-lg shadow-brand/20 disabled:opacity-60"
          >
            {generating ? 'Generando vista previa…' : 'Generar vista previa'}
          </button>
        </div>
      ) : (
        <div className="animate-fade-up space-y-5">
          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Previsualización del cuaderno
                </p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{farmName}</h2>
                <p className="text-sm text-muted">
                  {records.length} registros · {sent.length} enviados a SIEX · {pending.length}{' '}
                  pendientes
                </p>
              </div>
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                Listo
              </span>
            </div>

            {preview.length === 0 ? (
              <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted">
                Todavía no hay registros en el cuaderno.
              </p>
            ) : (
              <div className="space-y-3">
                {preview.map((a) => {
                  if (a.type === 'tratamiento') {
                    const names = a.parcelIds
                      .map((id) => parcels.find((p) => p.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')
                    return (
                      <article
                        key={a.id}
                        className="rounded-2xl border border-line bg-surface/60 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                              Fitosanitario
                            </p>
                            <p className="mt-0.5 font-semibold text-ink">{a.productName}</p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              a.sentToSiex
                                ? 'bg-brand-soft text-brand'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {a.sentToSiex ? 'SIEX enviado' : 'SIEX pendiente'}
                          </span>
                        </div>
                        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
                          <div>
                            <dt className="inline">Fecha: </dt>
                            <dd className="inline text-ink">{formatDate(a.date)}</dd>
                          </div>
                          <div>
                            <dt className="inline">Superficie: </dt>
                            <dd className="inline text-ink">{a.treatedAreaHa} ha</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="inline">Parcelas: </dt>
                            <dd className="inline text-ink">{names}</dd>
                          </div>
                          <div>
                            <dt className="inline">Cultivo: </dt>
                            <dd className="inline text-ink">{a.crop}</dd>
                          </div>
                          <div>
                            <dt className="inline">Reg.: </dt>
                            <dd className="inline text-ink">{a.registrationNumber}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="inline">Materia activa: </dt>
                            <dd className="inline text-ink">{a.activeIngredient}</dd>
                          </div>
                          <div>
                            <dt className="inline">Dosis: </dt>
                            <dd className="inline text-ink">
                              {a.dose} {a.doseUnit}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline">Método: </dt>
                            <dd className="inline text-ink">{methodLabel(a.applicationMethod)}</dd>
                          </div>
                          <div>
                            <dt className="inline">Aplicador: </dt>
                            <dd className="inline text-ink">{a.applicator}</dd>
                          </div>
                          <div>
                            <dt className="inline">P. seguridad: </dt>
                            <dd className="inline text-ink">{a.safetyDays} d</dd>
                          </div>
                          {a.notes && (
                            <div className="col-span-2">
                              <dt className="inline">Obs.: </dt>
                              <dd className="inline text-ink">{a.notes}</dd>
                            </div>
                          )}
                        </dl>
                      </article>
                    )
                  }

                  const names = fertParcelIds(a)
                    .map((id) => parcels.find((p) => p.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')
                  return (
                    <article
                      key={a.id}
                      className="rounded-2xl border border-line bg-sky-50/50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                            Fertilización
                          </p>
                          <p className="mt-0.5 font-semibold text-ink">{a.fertilizerName}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            a.sentToSiex
                              ? 'bg-brand-soft text-brand'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {a.sentToSiex ? 'SIEX enviado' : 'SIEX pendiente'}
                        </span>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
                        <div>
                          <dt className="inline">Fecha: </dt>
                          <dd className="inline text-ink">{formatDate(a.date)}</dd>
                        </div>
                        <div>
                          <dt className="inline">Superficie: </dt>
                          <dd className="inline text-ink">{a.treatedAreaHa} ha</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="inline">Parcelas: </dt>
                          <dd className="inline text-ink">{names}</dd>
                        </div>
                        <div>
                          <dt className="inline">Tipo: </dt>
                          <dd className="inline text-ink">{a.fertilizerType}</dd>
                        </div>
                        <div>
                          <dt className="inline">Dosis: </dt>
                          <dd className="inline text-ink">
                            {a.dose} {a.doseUnit}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline">N-P-K: </dt>
                          <dd className="inline text-ink">
                            {a.n ?? '—'} / {a.p ?? '—'} / {a.k ?? '—'}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline">Aplicador: </dt>
                          <dd className="inline text-ink">{a.applicator}</dd>
                        </div>
                      </dl>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-line bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-ink">Exportar cuaderno</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={exporting !== null}
                onClick={() => runExport('pdf')}
                className="rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {exporting === 'pdf' ? 'Preparando PDF…' : 'Descargar PDF legible'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={exporting !== null}
                  onClick={() => runExport('csv')}
                  className="rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink disabled:opacity-60"
                >
                  {exporting === 'csv' ? 'Generando…' : 'Exportar CSV'}
                </button>
                <button
                  type="button"
                  disabled={exporting !== null}
                  onClick={() => runExport('json')}
                  className="rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink disabled:opacity-60"
                >
                  {exporting === 'json' ? 'Generando…' : 'Exportar JSON SIEX'}
                </button>
              </div>
              <p className="mt-1 text-center text-xs text-muted">
                CSV y JSON usan estructura de demo compatible con SIEX. El PDF abre la impresión del
                navegador.
              </p>

              <div className="mt-3 border-t border-line pt-3">
                <a
                  href="https://www.fega.gob.es/es/siex1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand/30 bg-brand-muted py-3.5 text-sm font-semibold text-brand"
                >
                  Ir a la plataforma SIEX
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 4h8v8M16 4 8.5 11.5M12 16H5.5A1.5 1.5 0 0 1 4 14.5v-7"
                    />
                  </svg>
                </a>
                <p className="mt-2 text-center text-xs leading-relaxed text-muted">
                  Descarga primero el informe (PDF, CSV o JSON) y súbelo después en la plataforma
                  oficial del SIEX.
                </p>
              </div>
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
    </div>
  )
}
