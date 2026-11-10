import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  DEFAULT_APPLICATOR,
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

  const [step, setStep] = useState(0)
  const [parcelId, setParcelId] = useState<string | null>(preselected ?? null)
  const [productId, setProductId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [date, setDate] = useState(todayISO())
  const [doseRaw, setDoseRaw] = useState('')
  const [doseUnit, setDoseUnit] = useState<'kg/ha' | 'l/ha'>('kg/ha')
  const [fertilizerName, setFertilizerName] = useState('')
  const [fertilizerType, setFertilizerType] = useState('')
  const [n, setN] = useState('')
  const [p, setP] = useState('')
  const [k, setK] = useState('')
  const [applicator, setApplicator] = useState(DEFAULT_APPLICATOR)
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fertilizerProducts
    return fertilizerProducts.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.fertilizerType.toLowerCase().includes(q),
    )
  }, [query])

  const selectProduct = (id: string) => {
    const product = getFertilizerById(id)
    setProductId(id)
    if (product) {
      setFertilizerName(product.name)
      setFertilizerType(product.fertilizerType)
      setDoseRaw(String(product.defaultDose))
      setDoseUnit(product.unit)
      setN(String(product.n))
      setP(String(product.p))
      setK(String(product.k))
    }
  }

  const warnings = validateFertilization({
    parcelId,
    date,
    fertilizerName,
    fertilizerType,
    doseRaw,
    applicator,
  })
  const errors = warnings.filter((w) => w.severity === 'error')

  const goNext = () => {
    if (step === 0 && !parcelId) {
      setShowErrors(true)
      return
    }
    if (step === 1 && !fertilizerName.trim()) {
      setShowErrors(true)
      return
    }
    if (step === 2 && errors.length > 0) {
      setShowErrors(true)
      return
    }
    if (step < 3) {
      setShowErrors(false)
      setStep((s) => s + 1)
      return
    }

    if (errors.length > 0 || !parcelId) {
      setShowErrors(true)
      return
    }

    addFertilization({
      date,
      parcelId,
      fertilizerProductId: productId ?? undefined,
      fertilizerName: fertilizerName.trim(),
      fertilizerType: fertilizerType.trim(),
      dose: parseDoseInput(doseRaw)!,
      doseUnit,
      n: n ? Number(n.replace(',', '.')) : undefined,
      p: p ? Number(p.replace(',', '.')) : undefined,
      k: k ? Number(k.replace(',', '.')) : undefined,
      applicator: applicator.trim(),
      notes: notes.trim() || undefined,
    })
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center animate-fade-up">
        <div className="animate-check-pop mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sky-500 text-white">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-ink">Fertilización registrada</h1>
        <p className="mt-2 max-w-sm text-muted">
          {fertilizerName} en {getParcelById(parcelId!)?.name} · {formatDate(date)}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-8 w-full max-w-xs rounded-2xl bg-brand py-3.5 font-semibold text-white"
        >
          Volver al inicio
        </button>
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
            <h1 className="text-lg font-semibold text-ink">Fertilización</h1>
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
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">¿En qué parcela?</h2>
            {parcels.map((parcel) => (
              <button
                key={parcel.id}
                type="button"
                onClick={() => setParcelId(parcel.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left ${
                  parcelId === parcel.id ? 'border-sky-500 bg-sky-50' : 'border-line bg-white'
                }`}
              >
                <span
                  className="h-10 w-10 rounded-xl"
                  style={{ backgroundColor: `${parcel.color}33`, border: `2px solid ${parcel.color}` }}
                />
                <div>
                  <p className="font-semibold text-ink">{parcel.name}</p>
                  <p className="text-sm text-muted">
                    {parcel.crop} · {parcel.hectares} ha
                  </p>
                </div>
              </button>
            ))}
            {showErrors && !parcelId && (
              <p className="text-sm text-red-600">Selecciona una parcela</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-ink">Tipo de fertilizante</h2>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar abono…"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
            />
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
                      {f.fertilizerType} · N{f.n}-P{f.p}-K{f.k} · {f.defaultDose} {f.unit}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-ink">Datos de la fertilización</h2>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Fecha *</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-line px-4 py-3.5"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Fertilizante *</span>
              <input
                value={fertilizerName}
                onChange={(e) => setFertilizerName(e.target.value)}
                className="w-full rounded-2xl border border-line px-4 py-3.5"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Tipo *</span>
              <input
                value={fertilizerType}
                onChange={(e) => setFertilizerType(e.target.value)}
                className="w-full rounded-2xl border border-line px-4 py-3.5"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Dosis *</span>
                <input
                  value={doseRaw}
                  onChange={(e) => setDoseRaw(e.target.value)}
                  className="w-full rounded-2xl border border-line px-4 py-3.5"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Unidad</span>
                <select
                  value={doseUnit}
                  onChange={(e) => setDoseUnit(e.target.value as 'kg/ha' | 'l/ha')}
                  className="w-full rounded-2xl border border-line px-4 py-3.5"
                >
                  <option value="kg/ha">kg/ha</option>
                  <option value="l/ha">l/ha</option>
                </select>
              </label>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Nutrientes principales (%)</p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  placeholder="N"
                  className="rounded-2xl border border-line px-3 py-3 text-center"
                />
                <input
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="P"
                  className="rounded-2xl border border-line px-3 py-3 text-center"
                />
                <input
                  value={k}
                  onChange={(e) => setK(e.target.value)}
                  placeholder="K"
                  className="rounded-2xl border border-line px-3 py-3 text-center"
                />
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Aplicador *</span>
              <input
                value={applicator}
                onChange={(e) => setApplicator(e.target.value)}
                className="w-full rounded-2xl border border-line px-4 py-3.5"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Observaciones</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-2xl border border-line px-4 py-3.5"
              />
            </label>
            {showErrors &&
              errors.map((e) => (
                <p key={e.message} className="text-sm text-red-600">
                  {e.message}
                </p>
              ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-ink">Confirmar fertilización</h2>
            <div className="rounded-3xl border border-line divide-y divide-line text-sm">
              {[
                ['Parcela', getParcelById(parcelId!)?.name],
                ['Fecha', formatDate(date)],
                ['Fertilizante', fertilizerName],
                ['Tipo', fertilizerType],
                ['Dosis', `${doseRaw} ${doseUnit}`],
                ['N-P-K', `${n || '—'} / ${p || '—'} / ${k || '—'}`],
                ['Aplicador', applicator],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 px-5 py-3">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-ink text-right">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted">
              El registro se añadirá al historial inalterable del cuaderno.
            </p>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 border-t border-line bg-white/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-2xl border border-line px-5 py-3.5 font-semibold text-slate-600"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="flex-1 rounded-2xl bg-sky-600 py-3.5 font-semibold text-white hover:bg-sky-500"
          >
            {step === 3 ? 'Confirmar y guardar' : 'Continuar'}
          </button>
        </div>
      </footer>
    </div>
  )
}
