import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ParcelMap } from '../components/ParcelMap'
import { useApp } from '../context/AppContext'
import {
  fertilizerProducts,
  formatDate,
  getFertilizerById,
} from '../data/sampleData'
import { parseDoseInput } from '../lib/validation'

const STEPS = ['Parcela', 'Abono', 'Datos', 'Confirmar'] as const

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function areaFromParcels(
  ids: string[],
  parcels: { id: string; hectares: number }[],
): string {
  const total = ids.reduce((sum, id) => {
    const parcel = parcels.find((p) => p.id === id)
    return sum + (parcel?.hectares ?? 0)
  }, 0)
  return total > 0 ? String(total) : ''
}

export function RegisterFertilization() {
  const navigate = useNavigate()
  const location = useLocation()
  const { parcels, addFertilization } = useApp()
  const preselected = (location.state as { parcelId?: string } | null)?.parcelId

  const [step, setStep] = useState(0)
  const [parcelIds, setParcelIds] = useState<string[]>(() =>
    preselected && parcels.some((p) => p.id === preselected) ? [preselected] : [],
  )
  const [productId, setProductId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [date, setDate] = useState(todayISO())
  const [doseRaw, setDoseRaw] = useState('')
  const [doseUnit, setDoseUnit] = useState<'kg/ha' | 'l/ha'>('kg/ha')
  const [treatedAreaHa, setTreatedAreaHa] = useState(() =>
    areaFromParcels(
      preselected && parcels.some((p) => p.id === preselected) ? [preselected] : [],
      parcels,
    ),
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
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [savedId, setSavedId] = useState<string | null>(null)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fertilizerProducts
    return fertilizerProducts.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.fertilizerType.toLowerCase().includes(q),
    )
  }, [query])

  const parcelNames = parcelIds
    .map((id) => parcels.find((p) => p.id === id)?.name)
    .filter(Boolean)
    .join(', ')

  const primaryParcelId = parcelIds[0] ?? null

  const setSelectedParcels = (ids: string[]) => {
    setParcelIds(ids)
    setTreatedAreaHa(areaFromParcels(ids, parcels))
    setFieldErrors([])
  }

  const toggleParcel = (id: string) => {
    const next = parcelIds.includes(id)
      ? parcelIds.filter((x) => x !== id)
      : [...parcelIds, id]
    setSelectedParcels(next)
  }

  const selectProduct = (id: string) => {
    const product = getFertilizerById(id)
    if (!product) return
    setProductId(id)
    setFertilizerName(product.name)
    setFertilizerType(product.fertilizerType)
    setDoseRaw(String(product.defaultDose).replace('.', ','))
    setDoseUnit(product.unit)
    setN(String(product.n))
    setP(String(product.p))
    setK(String(product.k))
    setFieldErrors([])
  }

  const validateDatos = (): string[] => {
    const missing: string[] = []
    if (!date) missing.push('Indica la fecha')
    if (!fertilizerName.trim()) missing.push('Indica el fertilizante o abono')
    if (!fertilizerType.trim()) missing.push('Indica el tipo de fertilizante')
    const area = Number(String(treatedAreaHa).replace(',', '.'))
    if (!(area > 0)) missing.push('Indica la superficie fertilizada (ha)')
    if (parseDoseInput(doseRaw) === null) missing.push('Indica una dosis numérica válida')
    if (!applicator.trim()) missing.push('Indica el nombre del aplicador')
    return missing
  }

  const goNext = () => {
    if (step === 0) {
      if (parcelIds.length === 0) {
        setFieldErrors(['Selecciona al menos una parcela para continuar'])
        return
      }
      // Asegurar superficie antes de seguir
      setTreatedAreaHa(areaFromParcels(parcelIds, parcels))
      setFieldErrors([])
      setStep(1)
      return
    }

    if (step === 1) {
      setFieldErrors([])
      // Si hay producto elegido, los datos ya están pre-rellenos
      if (!treatedAreaHa) {
        setTreatedAreaHa(areaFromParcels(parcelIds, parcels))
      }
      setStep(2)
      return
    }

    if (step === 2) {
      const area =
        treatedAreaHa && Number(String(treatedAreaHa).replace(',', '.')) > 0
          ? treatedAreaHa
          : areaFromParcels(parcelIds, parcels)
      if (area !== treatedAreaHa) setTreatedAreaHa(area)

      const missing: string[] = []
      if (!date) missing.push('Indica la fecha')
      if (!fertilizerName.trim()) missing.push('Indica el fertilizante o abono')
      if (!fertilizerType.trim()) missing.push('Indica el tipo de fertilizante')
      if (!(Number(String(area).replace(',', '.')) > 0)) {
        missing.push('Indica la superficie fertilizada (ha)')
      }
      if (parseDoseInput(doseRaw) === null) missing.push('Indica una dosis numérica válida')
      if (!applicator.trim()) missing.push('Indica el nombre del aplicador')

      if (missing.length > 0) {
        setFieldErrors(missing)
        return
      }
      setFieldErrors([])
      setStep(3)
      return
    }

    // Confirmar y guardar
    const missing = validateDatos()
    if (missing.length > 0 || parcelIds.length === 0) {
      setFieldErrors(missing.length ? missing : ['Faltan datos para guardar'])
      setStep(2)
      return
    }

    const dose = parseDoseInput(doseRaw)
    if (dose === null) {
      setFieldErrors(['Indica una dosis numérica válida'])
      setStep(2)
      return
    }

    setSaving(true)
    addFertilization({
      date,
      parcelIds: [...parcelIds],
      treatedAreaHa: Number(String(treatedAreaHa).replace(',', '.')),
      fertilizerProductId: productId ?? undefined,
      fertilizerName: fertilizerName.trim(),
      fertilizerType: fertilizerType.trim(),
      dose,
      doseUnit,
      n: n.trim() !== '' ? Number(String(n).replace(',', '.')) : undefined,
      p: p.trim() !== '' ? Number(String(p).replace(',', '.')) : undefined,
      k: k.trim() !== '' ? Number(String(k).replace(',', '.')) : undefined,
      applicator: applicator.trim(),
      notes: notes.trim() || undefined,
    })
    setSavedId(primaryParcelId)
    window.setTimeout(() => {
      setSaving(false)
      setDone(true)
    }, 250)
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center animate-fade-up">
        <div className="animate-check-pop mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sky-500 text-white">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-ink">Fertilización guardada correctamente</h1>
        <p className="mt-2 max-w-sm text-muted">
          {fertilizerName} en {parcelNames} · {treatedAreaHa} ha · {formatDate(date)}
        </p>
        <p className="mt-3 max-w-sm rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
          El registro ya está en el historial inalterable. Puedes verlo en la parcela y en Informes
          (pendiente de marcar como enviado a SIEX).
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
          {savedId && (
            <button
              type="button"
              onClick={() => navigate(`/parcelas/${savedId}`)}
              className="rounded-2xl bg-sky-600 py-3.5 font-semibold text-white"
            >
              Ver historial de la parcela
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/informes')}
            className="rounded-2xl bg-brand py-3.5 font-semibold text-white"
          >
            Ir a Informes
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-2xl py-3 font-medium text-muted hover:text-ink"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const canContinueStep0 = parcelIds.length > 0

  return (
    <div className="flex min-h-dvh flex-col bg-white">
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
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-sky-500' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 px-5 py-5 pb-28">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">¿En qué parcela(s)?</h2>
              <p className="mt-1 text-sm text-muted">
                Elige una o varias en la lista. El mapa solo muestra la selección.
              </p>
            </div>

            {parcels.length === 0 ? (
              <p className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-muted">
                No hay parcelas. Créalas primero en la sección Parcelas.
              </p>
            ) : (
              <>
                <ParcelMap
                  selectedIds={parcelIds}
                  height="h-40"
                  interactive={false}
                />

                {canContinueStep0 && (
                  <div className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-medium text-sky-900">
                    {parcelIds.length} seleccionada{parcelIds.length > 1 ? 's' : ''} ·{' '}
                    {treatedAreaHa || '0'} ha
                  </div>
                )}

                <ul className="space-y-2">
                  {parcels.map((parcel) => {
                    const selected = parcelIds.includes(parcel.id)
                    return (
                      <li key={parcel.id}>
                        <button
                          type="button"
                          onClick={() => toggleParcel(parcel.id)}
                          aria-pressed={selected}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                            selected
                              ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                              : 'border-line bg-white hover:border-sky-300'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold ${
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

            {fieldErrors.length > 0 && (
              <div className="space-y-1">
                {fieldErrors.map((msg) => (
                  <p key={msg} className="text-sm font-medium text-red-600">
                    {msg}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Tipo de fertilizante / abono</h2>
              <p className="mt-1 text-sm text-muted">
                Elige un abono de ejemplo para pre-rellenar dosis y N-P-K, o continúa y escríbelo a
                mano.
              </p>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar abono…"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 outline-none ring-sky-300 focus:ring-2"
            />
            <ul className="space-y-2">
              {suggestions.map((f) => {
                const selected = productId === f.id
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => selectProduct(f.id)}
                      className={`w-full rounded-2xl border px-4 py-3.5 text-left transition ${
                        selected
                          ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                          : 'border-line bg-white hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-ink">{f.name}</p>
                          <p className="text-sm text-muted">
                            {f.fertilizerType} · N{f.n}-P{f.p}-K{f.k}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            Dosis habitual {f.defaultDose} {f.unit}
                          </p>
                        </div>
                        {selected && (
                          <span className="text-xs font-semibold text-sky-700">Elegido</span>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
            {productId && (
              <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
                Abono seleccionado: se pre-rellenarán dosis y nutrientes en el siguiente paso.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Datos de la fertilización</h2>
              <p className="mt-1 text-sm text-muted">
                Revisa o completa los campos. Solo son obligatorios los marcados con *.
              </p>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Fecha *</span>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setFieldErrors([])
                }}
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Fertilizante / abono *
              </span>
              <input
                value={fertilizerName}
                onChange={(e) => {
                  setFertilizerName(e.target.value)
                  setFieldErrors([])
                }}
                placeholder="Nombre del abono"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo *</span>
              <input
                value={fertilizerType}
                onChange={(e) => {
                  setFertilizerType(e.target.value)
                  setFieldErrors([])
                }}
                placeholder="Nitrogenado, NPK, orgánico…"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Superficie fertilizada (ha) *
              </span>
              <input
                value={treatedAreaHa}
                onChange={(e) => {
                  setTreatedAreaHa(e.target.value)
                  setFieldErrors([])
                }}
                inputMode="decimal"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
              />
              <p className="mt-1 text-xs text-muted">
                Calculada según las parcelas seleccionadas ({parcelNames || '—'}). Puedes ajustarla.
              </p>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Dosis *</span>
                <input
                  value={doseRaw}
                  onChange={(e) => {
                    setDoseRaw(e.target.value)
                    setFieldErrors([])
                  }}
                  inputMode="decimal"
                  placeholder="Ej. 200"
                  className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Unidad *</span>
                <select
                  value={doseUnit}
                  onChange={(e) => setDoseUnit(e.target.value as 'kg/ha' | 'l/ha')}
                  className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="kg/ha">kg/ha</option>
                  <option value="l/ha">l/ha</option>
                </select>
              </label>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">
                Nutrientes principales (%) — opcional
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['N', n, setN],
                  ['P', p, setP],
                  ['K', k, setK],
                ] as const).map(([label, value, setter]) => (
                  <label key={label} className="block text-center">
                    <span className="mb-1 block text-xs text-muted">{label}</span>
                    <input
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      inputMode="decimal"
                      className="w-full rounded-2xl border border-line px-3 py-3 text-center outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </label>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Aplicador *</span>
              <input
                value={applicator}
                onChange={(e) => {
                  setApplicator(e.target.value)
                  setFieldErrors([])
                }}
                placeholder="Nombre y apellidos del aplicador"
                className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Observaciones</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Condiciones, motivo, lote del abono…"
                className="w-full resize-none rounded-2xl border border-line px-4 py-3.5 outline-none focus:ring-2 focus:ring-sky-300"
              />
            </label>

            {fieldErrors.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-800">Faltan datos obligatorios:</p>
                {fieldErrors.map((msg) => (
                  <p key={msg} className="text-sm text-red-700">
                    · {msg}
                  </p>
                ))}
              </div>
            )}
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

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                setFieldErrors([])
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
            className={`flex-1 rounded-2xl py-3.5 font-semibold text-white transition disabled:opacity-60 ${
              step === 0 && !canContinueStep0
                ? 'bg-sky-600/70'
                : 'bg-sky-600 hover:bg-sky-500'
            }`}
          >
            {saving
              ? 'Guardando…'
              : step === 3
                ? 'Confirmar y guardar'
                : 'Continuar'}
          </button>
        </div>
      </footer>
    </div>
  )
}
