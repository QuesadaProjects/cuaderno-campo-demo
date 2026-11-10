import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ParcelMap } from '../components/ParcelMap'
import { useApp } from '../context/AppContext'
import {
  fertilizerProducts,
  formatDate,
  getFertilizerById,
} from '../data/sampleData'
import { parseDoseInput, validateFertilization } from '../lib/validation'

const STEPS = ['Parcela', 'Abono', 'Datos', 'Confirmar'] as const

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function RegisterFertilization() {
  const navigate = useNavigate()
  const location = useLocation()
  const { parcels, addFertilization, getParcelById } = useApp()
  const preselected = (location.state as { parcelId?: string } | null)?.parcelId

  const initialParcel = preselected
    ? parcels.find((p) => p.id === preselected)
    : undefined

  const [step, setStep] = useState(0)
  const [parcelIds, setParcelIds] = useState<string[]>(() =>
    preselected ? [preselected] : [],
  )
  const [productId, setProductId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [date, setDate] = useState(todayISO())
  const [doseRaw, setDoseRaw] = useState('')
  const [doseUnit, setDoseUnit] = useState<'kg/ha' | 'l/ha'>('kg/ha')
  const [treatedAreaHa, setTreatedAreaHa] = useState(
    initialParcel ? String(initialParcel.hectares) : '',
  )
  const [fertilizerName, setFertilizerName] = useState('')
  const [fertilizerType, setFertilizerType] = useState('')
  const [n, setN] = useState('')
  const [p, setP] = useState('')
  const [k, setK] = useState('')
  const [applicator, setApplicator] = useState('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fertilizerProducts
    return fertilizerProducts.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.fertilizerType.toLowerCase().includes(q),
    )
  }, [query])

  // Mantener superficie sincronizada con las parcelas elegidas
  useEffect(() => {
    if (parcelIds.length === 0) {
      setTreatedAreaHa('')
      return
    }
    const total = parcelIds.reduce((sum, id) => {
      const parcel = parcels.find((p) => p.id === id)
      return sum + (parcel?.hectares ?? 0)
    }, 0)
    setTreatedAreaHa(String(total))
  }, [parcelIds, parcels])

  const toggleParcel = (id: string) => {
    setShowErrors(false)
    setParcelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const selectProduct = (id: string) => {
    const product = getFertilizerById(id)
    setProductId(id)
    if (product) {
      setFertilizerName(product.name)
      setFertilizerType(product.fertilizerType)
      setDoseRaw(String(product.defaultDose).replace('.', ','))
      setDoseUnit(product.unit)
      setN(String(product.n))
      setP(String(product.p))
      setK(String(product.k))
    }
  }

  const warnings = validateFertilization({
    parcelIds,
    treatedAreaHa: Number(String(treatedAreaHa).replace(',', '.')),
    date,
    fertilizerName,
    fertilizerType,
    doseRaw,
    applicator,
  })
  const errors = warnings.filter((w) => w.severity === 'error')

  const goNext = () => {
    if (step === 0) {
      if (parcelIds.length === 0) {
        setShowErrors(true)
        return
      }
      setShowErrors(false)
      setStep(1)
      return
    }

    if (step === 1) {
      setShowErrors(false)
      setStep(2)
      return
    }

    if (step === 2) {
      if (errors.length > 0) {
        setShowErrors(true)
        return
      }
      setShowErrors(false)
      setStep(3)
      return
    }

    setShowErrors(true)
    if (errors.length > 0) return

    setSaving(true)
    addFertilization({
      date,
      parcelIds,
      treatedAreaHa: Number(String(treatedAreaHa).replace(',', '.')),
      fertilizerProductId: productId ?? undefined,
      fertilizerName: fertilizerName.trim(),
      fertilizerType: fertilizerType.trim(),
      dose: parseDoseInput(doseRaw)!,
      doseUnit,
      n: n !== '' ? Number(String(n).replace(',', '.')) : undefined,
      p: p !== '' ? Number(String(p).replace(',', '.')) : undefined,
      k: k !== '' ? Number(String(k).replace(',', '.')) : undefined,
      applicator: applicator.trim(),
      notes: notes.trim() || undefined,
    })
    window.setTimeout(() => {
      setSaving(false)
      setDone(true)
    }, 350)
  }

  const parcelNames = parcelIds
    .map((id) => getParcelById(id)?.name)
    .filter(Boolean)
    .join(', ')

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center animate-fade-up">
        <div className="animate-check-pop mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sky-500 text-white">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-ink">Fertilización guardada</h1>
        <p className="mt-2 max-w-sm text-muted">
          {fertilizerName} en {parcelNames} · {treatedAreaHa} ha · {formatDate(date)}
        </p>
        <p className="mt-3 max-w-sm rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
          El registro forma parte del historial inalterable. Puedes marcarlo como enviado a SIEX desde
          Informes.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-2xl bg-brand py-3.5 font-semibold text-white"
          >
            Volver al inicio
          </button>
          <button
            type="button"
            onClick={() => navigate('/informes')}
            className="rounded-2xl py-3 font-medium text-muted hover:text-ink"
          >
            Ir a informes SIEX
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 pt-4 pb-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/registrar"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-slate-600"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M5 5l10 10M15 5 5 15" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-ink">Registro de fertilización</h1>
            <p className="text-xs text-muted">
              Paso {step + 1} de {STEPS.length} · {STEPS[step]}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={STEPS[i]}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-sky-500' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 px-5 py-5">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Parcela(s) fertilizada(s)</h2>
              <p className="mt-1 text-sm text-muted">
                Toca el mapa o la lista. Puedes seleccionar una o varias.
              </p>
            </div>
            {parcels.length === 0 ? (
              <p className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-muted">
                No hay parcelas. Créalas primero en la sección Parcelas.
              </p>
            ) : (
              <>
                <div className="relative z-0">
                  <ParcelMap selectedIds={parcelIds} onSelect={toggleParcel} height="h-48" />
                </div>
                {parcelIds.length > 0 && (
                  <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800">
                    {parcelIds.length} parcela{parcelIds.length > 1 ? 's' : ''} seleccionada
                    {parcelIds.length > 1 ? 's' : ''}
                    {treatedAreaHa ? ` · ${treatedAreaHa} ha` : ''}
                  </p>
                )}
                <ul className="relative z-10 space-y-2">
                  {parcels.map((parcel) => {
                    const selected = parcelIds.includes(parcel.id)
                    return (
                      <li key={parcel.id}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleParcel(parcel.id)
                          }}
                          aria-pressed={selected}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                            selected
                              ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                              : 'border-line bg-white hover:border-sky-300'
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                              selected
                                ? 'border-sky-500 bg-sky-500 text-white'
                                : 'border-slate-300 bg-white text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-ink">{parcel.name}</p>
                            <p className="text-sm text-muted">
                              {parcel.crop} · {parcel.hectares} ha
                            </p>
                          </div>
                          {selected && (
                            <span className="text-xs font-semibold text-sky-700">Seleccionada</span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
            {showErrors && parcelIds.length === 0 && (
              <p className="text-sm font-medium text-red-600">
                Selecciona al menos una parcela para continuar
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Tipo de fertilizante / abono</h2>
              <p className="mt-1 text-sm text-muted">
                Elige un abono de ejemplo o continúa y completa los datos a mano.
              </p>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar abono…"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
            />
            {suggestions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No hay abonos con ese nombre</p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => selectProduct(f.id)}
                      className={`w-full rounded-2xl border px-4 py-3.5 text-left ${
                        productId === f.id ? 'border-sky-500 bg-sky-50' : 'border-line bg-white'
                      }`}
                    >
                      <p className="font-semibold text-ink">{f.name}</p>
                      <p className="text-sm text-muted">
                        {f.fertilizerType} · N{f.n}-P{f.p}-K{f.k} · dosis habitual {f.defaultDose}{' '}
                        {f.unit}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted">
              Si no encuentras el abono, pulsa Continuar y escríbelo a mano en el siguiente paso.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Datos de la fertilización</h2>
              <p className="mt-1 text-sm text-muted">Completa los campos obligatorios del cuaderno.</p>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Fecha *</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Fertilizante / abono *</span>
              <input
                value={fertilizerName}
                onChange={(e) => setFertilizerName(e.target.value)}
                placeholder="Nombre del abono"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo *</span>
              <input
                value={fertilizerType}
                onChange={(e) => setFertilizerType(e.target.value)}
                placeholder="Nitrogenado, NPK, orgánico…"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Superficie fertilizada (ha) *
              </span>
              <input
                value={treatedAreaHa}
                onChange={(e) => setTreatedAreaHa(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Dosis *</span>
                <input
                  value={doseRaw}
                  onChange={(e) => setDoseRaw(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Unidad *</span>
                <select
                  value={doseUnit}
                  onChange={(e) => setDoseUnit(e.target.value as 'kg/ha' | 'l/ha')}
                  className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
                >
                  <option value="kg/ha">kg/ha</option>
                  <option value="l/ha">l/ha</option>
                </select>
              </label>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Nutrientes principales (%)</p>
              <div className="grid grid-cols-3 gap-2">
                <label className="block text-center">
                  <span className="mb-1 block text-xs text-muted">N</span>
                  <input
                    value={n}
                    onChange={(e) => setN(e.target.value)}
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-line px-3 py-3 text-center outline-none ring-sky-300 focus:ring-2"
                  />
                </label>
                <label className="block text-center">
                  <span className="mb-1 block text-xs text-muted">P</span>
                  <input
                    value={p}
                    onChange={(e) => setP(e.target.value)}
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-line px-3 py-3 text-center outline-none ring-sky-300 focus:ring-2"
                  />
                </label>
                <label className="block text-center">
                  <span className="mb-1 block text-xs text-muted">K</span>
                  <input
                    value={k}
                    onChange={(e) => setK(e.target.value)}
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-line px-3 py-3 text-center outline-none ring-sky-300 focus:ring-2"
                  />
                </label>
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Aplicador *</span>
              <input
                value={applicator}
                onChange={(e) => setApplicator(e.target.value)}
                placeholder="Nombre y apellidos del aplicador"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Observaciones</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Condiciones, motivo, lote del abono…"
                className="w-full resize-none rounded-2xl border border-line px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
              />
            </label>
            {showErrors &&
              errors.map((e) => (
                <p key={e.message} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {e.message}
                </p>
              ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Confirmación</h2>
              <p className="mt-1 text-sm text-muted">
                Al guardar, el registro queda en el historial y no se podrá modificar.
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-line bg-white">
              <div className="border-b border-line bg-sky-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Resumen fertilización
                </p>
                <p className="mt-1 text-lg font-semibold text-ink">{fertilizerName}</p>
                <p className="text-sm text-muted">{fertilizerType}</p>
              </div>
              <dl className="divide-y divide-line text-sm">
                {[
                  ['Fecha', formatDate(date)],
                  ['Parcelas', parcelNames],
                  ['Superficie', `${treatedAreaHa} ha`],
                  ['Dosis', `${doseRaw} ${doseUnit}`],
                  ['N-P-K', `${n || '—'} / ${p || '—'} / ${k || '—'}`],
                  ['Aplicador', applicator],
                  ['Observaciones', notes || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 px-5 py-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 border-t border-line bg-white/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowErrors(false)
                setStep((s) => s - 1)
              }}
              className="rounded-2xl border border-line px-5 py-3.5 font-semibold text-slate-600"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={goNext}
            className="flex-1 rounded-2xl bg-sky-600 py-3.5 font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : step === 3 ? 'Confirmar y guardar' : 'Continuar'}
          </button>
        </div>
      </footer>
    </div>
  )
}
