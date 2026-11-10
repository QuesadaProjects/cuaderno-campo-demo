import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ParcelMap } from '../components/ParcelMap'
import { useApp } from '../context/AppContext'
import {
  formatDate,
  getPhytoById,
  methodLabel,
  phytosanitaryProducts,
} from '../data/sampleData'
import { parseDoseInput, validateTreatment } from '../lib/validation'
import {
  APPLICATION_METHODS,
  type ApplicationMethod,
  type DoseUnit,
} from '../types'

const STEPS = ['Parcela', 'Producto', 'Datos', 'Confirmar'] as const

const TYPE_LABELS: Record<string, string> = {
  herbicida: 'Herbicida',
  fungicida: 'Fungicida',
  insecticida: 'Insecticida',
  acaricida: 'Acaricida',
  otros: 'Otros',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function RegisterTreatment() {
  const navigate = useNavigate()
  const location = useLocation()
  const { parcels, addTreatment, getParcelById } = useApp()
  const preselected = (location.state as { parcelId?: string } | null)?.parcelId
  const initialParcel = preselected ? getParcelById(preselected) : undefined

  const [step, setStep] = useState(0)
  const [parcelIds, setParcelIds] = useState<string[]>(preselected ? [preselected] : [])
  const [productId, setProductId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [useUnknown, setUseUnknown] = useState(false)
  const [unknownName, setUnknownName] = useState('')
  const [unknownReg, setUnknownReg] = useState('')
  const [unknownActive, setUnknownActive] = useState('')
  const [doseRaw, setDoseRaw] = useState('')
  const [doseUnit, setDoseUnit] = useState<DoseUnit>('l/ha')
  const [date, setDate] = useState(todayISO())
  const [applicator, setApplicator] = useState('')
  const [crop, setCrop] = useState(initialParcel?.crop ?? '')
  const [treatedAreaHa, setTreatedAreaHa] = useState(
    initialParcel ? String(initialParcel.hectares) : '',
  )
  const [applicationMethod, setApplicationMethod] = useState<ApplicationMethod>('pulverizacion')
  const [safetyDays, setSafetyDays] = useState('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const selectedProduct = productId ? getPhytoById(productId) : undefined

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return phytosanitaryProducts
    return phytosanitaryProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.registrationNumber.toLowerCase().includes(q) ||
        p.activeIngredient.toLowerCase().includes(q) ||
        TYPE_LABELS[p.type]?.toLowerCase().includes(q),
    )
  }, [query])

  const toggleParcel = (id: string) => {
    setShowErrors(false)
    setParcelIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      const selected = next
        .map((pid) => parcels.find((p) => p.id === pid))
        .filter(Boolean)
      if (selected.length === 0) {
        setTreatedAreaHa('')
      } else if (selected.length === 1) {
        setCrop(selected[0]!.crop)
        setTreatedAreaHa(String(selected[0]!.hectares))
      } else {
        const crops = [...new Set(selected.map((p) => p!.crop))]
        setCrop(crops.length === 1 ? crops[0]! : '')
        setTreatedAreaHa(String(selected.reduce((s, p) => s + p!.hectares, 0)))
      }
      return next
    })
  }

  const selectProduct = (id: string) => {
    const product = getPhytoById(id)
    setProductId(id)
    setUseUnknown(false)
    setShowErrors(false)
    if (product) {
      // Pre-relleno inteligente: dosis habitual + plazo de seguridad
      setDoseRaw(String(product.defaultDose).replace('.', ','))
      setDoseUnit(product.unit)
      setSafetyDays(String(product.safetyDays))
    }
  }

  const warnings = validateTreatment({
    parcelIds,
    treatedAreaHa: Number(treatedAreaHa.replace(',', '.')),
    crop,
    productId: useUnknown ? null : productId,
    doseRaw,
    doseUnit,
    applicator,
    date,
    applicationMethod,
    allowUnknownProduct: useUnknown,
    unknownProductName: unknownName,
  })
  const errors = warnings.filter((w) => w.severity === 'error')
  const softWarnings = warnings.filter((w) => w.severity === 'warning')
  const doseValue = parseDoseInput(doseRaw)
  const doseOverMax =
    !!selectedProduct && doseValue !== null && doseValue > selectedProduct.maxDose

  const canLeaveStep = () => {
    if (step === 0) return parcelIds.length > 0
    if (step === 1) return useUnknown ? unknownName.trim().length > 0 : productId !== null
    if (step === 2) return errors.length === 0
    return true
  }

  const goNext = async () => {
    if (step < 3) {
      if (!canLeaveStep()) {
        setShowErrors(true)
        return
      }
      setShowErrors(false)
      setStep((s) => s + 1)
      return
    }

    setShowErrors(true)
    if (errors.length > 0) return

    const dose = parseDoseInput(doseRaw)!
    const productName = useUnknown ? unknownName.trim() : selectedProduct!.name
    const registrationNumber = useUnknown
      ? unknownReg.trim() || 'SIN-REGISTRO'
      : selectedProduct!.registrationNumber
    const activeIngredient = useUnknown
      ? unknownActive.trim() || 'No indicada'
      : selectedProduct!.activeIngredient

    setSaving(true)
    try {
      await addTreatment({
        date,
        parcelIds,
        treatedAreaHa: Number(treatedAreaHa.replace(',', '.')),
        crop: crop.trim(),
        productId: useUnknown ? 'unknown' : productId!,
        productName,
        registrationNumber,
        activeIngredient,
        dose,
        doseUnit,
        applicator: applicator.trim(),
        safetyDays: Number(safetyDays) || 0,
        applicationMethod,
        notes: notes.trim() || undefined,
      })
      setDone(true)
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'No se pudo guardar el tratamiento en Supabase',
      )
    } finally {
      setSaving(false)
    }
  }

  const savedProductLabel = useUnknown ? unknownName : selectedProduct?.name
  const savedParcelNames = parcelIds
    .map((id) => getParcelById(id)?.name)
    .filter(Boolean)
    .join(', ')

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center animate-fade-up">
        <div className="animate-check-pop mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Guardado</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Tratamiento registrado con éxito</h1>
        <p className="mt-2 max-w-sm text-muted">
          {savedProductLabel} en {savedParcelNames} · {treatedAreaHa} ha · {formatDate(date)}
        </p>
        <div className="mt-4 w-full max-w-sm space-y-2 rounded-2xl border border-brand/20 bg-brand-muted px-4 py-3 text-left text-sm text-ink">
          <p className="font-semibold">Registro añadido al cuaderno</p>
          <p className="text-muted">
            Forma parte del historial inalterable. Puedes marcarlo como enviado a SIEX cuando quieras
            desde Informes.
          </p>
        </div>
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
            Ir a Informes
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
            <h1 className="text-lg font-semibold text-ink">Tratamiento fitosanitario</h1>
            <p className="text-xs text-muted">
              Paso {step + 1} de {STEPS.length} · {STEPS[step]}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={STEPS[i]}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 px-5 py-5">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Parcela(s) tratada(s)</h2>
              <p className="mt-1 text-sm text-muted">
                Elige una o varias. La superficie y el cultivo se rellenan solos cuando sea posible.
              </p>
            </div>
            <ParcelMap selectedIds={parcelIds} onSelect={toggleParcel} height="h-48" />
            {parcelIds.length > 0 && (
              <div className="rounded-xl bg-brand-muted px-3 py-2 text-sm font-medium text-ink">
                {parcelIds.length} parcela{parcelIds.length > 1 ? 's' : ''} seleccionada
                {parcelIds.length > 1 ? 's' : ''}
                {treatedAreaHa ? ` · ${treatedAreaHa} ha` : ''}
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
                          ? 'border-brand bg-brand-muted ring-2 ring-brand/25'
                          : 'border-line bg-white hover:border-brand/40'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold ${
                          selected
                            ? 'border-brand bg-brand text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{parcel.name}</p>
                        <p className="text-sm text-muted">
                          {parcel.crop} · {parcel.hectares} ha
                          {parcel.sigpacRef ? ` · ${parcel.sigpacRef}` : ''}
                        </p>
                      </div>
                      {selected && (
                        <span className="text-xs font-semibold text-brand">Seleccionada</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            {showErrors && parcelIds.length === 0 && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Elige al menos una parcela para continuar
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Producto fitosanitario</h2>
              <p className="mt-1 text-sm text-muted">
                Nombre comercial y nº de registro. Busca en la lista de ejemplo.
              </p>
            </div>
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o nº registro…"
                className="w-full rounded-2xl border border-line bg-surface py-3.5 pr-4 pl-4 text-[15px] outline-none ring-brand/30 focus:ring-2"
                autoFocus
              />
            </div>
            <ul className="space-y-2">
              {suggestions.map((product) => {
                const selected = !useUnknown && productId === product.id
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => selectProduct(product.id)}
                      className={`w-full rounded-2xl border px-4 py-3.5 text-left transition ${
                        selected ? 'border-brand bg-brand-muted' : 'border-line bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-ink">{product.name}</p>
                          <p className="text-sm text-muted">
                            Reg. {product.registrationNumber} · {product.activeIngredient}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {TYPE_LABELS[product.type]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Dosis habitual {product.defaultDose} {product.unit} (máx. {product.maxDose}) ·
                        Seguridad {product.safetyDays} d
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>

            <button
              type="button"
              onClick={() => {
                setUseUnknown(true)
                setProductId(null)
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                useUnknown ? 'border-amber-400 bg-amber-50' : 'border-dashed border-line'
              }`}
            >
              El producto no está en la lista…
            </button>

            {useUnknown && (
              <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-sm text-amber-900">
                  Aviso: el producto no está en la lista de ejemplo. Verifica el nº de registro oficial.
                </p>
                <input
                  value={unknownName}
                  onChange={(e) => setUnknownName(e.target.value)}
                  placeholder="Nombre comercial *"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
                />
                <input
                  value={unknownReg}
                  onChange={(e) => setUnknownReg(e.target.value)}
                  placeholder="Nº de registro"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
                />
                <input
                  value={unknownActive}
                  onChange={(e) => setUnknownActive(e.target.value)}
                  placeholder="Materia activa"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={doseRaw}
                    onChange={(e) => setDoseRaw(e.target.value)}
                    placeholder="Dosis"
                    className="rounded-xl border border-line bg-white px-3 py-2.5"
                  />
                  <select
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value as DoseUnit)}
                    className="rounded-xl border border-line bg-white px-3 py-2.5"
                  >
                    <option value="l/ha">l/ha</option>
                    <option value="kg/ha">kg/ha</option>
                    <option value="ml/hl">ml/hl</option>
                    <option value="g/hl">g/hl</option>
                  </select>
                </div>
                <input
                  value={safetyDays}
                  onChange={(e) => setSafetyDays(e.target.value)}
                  placeholder="Plazo de seguridad (días)"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
                />
              </div>
            )}

            {showErrors && !useUnknown && !productId && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Elige un producto de la lista para continuar
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Datos del tratamiento</h2>
              <p className="mt-1 text-sm text-muted">
                Revisa los valores pre-rellenados. Solo debes completar lo que falte.
              </p>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Fecha del tratamiento *</span>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setShowErrors(false)
                }}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Cultivo *</span>
              <input
                type="text"
                value={crop}
                onChange={(e) => {
                  setCrop(e.target.value)
                  setShowErrors(false)
                }}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Superficie tratada (ha) *</span>
              <input
                type="text"
                inputMode="decimal"
                value={treatedAreaHa}
                onChange={(e) => {
                  setTreatedAreaHa(e.target.value)
                  setShowErrors(false)
                }}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              />
              <p className="mt-1 text-xs text-muted">Calculada según las parcelas elegidas. Puedes ajustarla.</p>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Dosis *</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={doseRaw}
                  onChange={(e) => {
                    setDoseRaw(e.target.value)
                    setShowErrors(false)
                  }}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 outline-none focus:ring-2 ${
                    doseOverMax
                      ? 'border-amber-400 ring-2 ring-amber-200'
                      : 'border-line ring-brand/30'
                  }`}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Unidad *</span>
                <select
                  value={doseUnit}
                  onChange={(e) => setDoseUnit(e.target.value as DoseUnit)}
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
                >
                  <option value="l/ha">l/ha</option>
                  <option value="kg/ha">kg/ha</option>
                  <option value="ml/hl">ml/hl</option>
                  <option value="g/hl">g/hl</option>
                </select>
              </label>
            </div>

            {selectedProduct && (
              <p className="text-xs text-muted">
                Pre-rellenado: {selectedProduct.defaultDose} {selectedProduct.unit} · Máximo de
                ejemplo {selectedProduct.maxDose} {selectedProduct.unit} ·{' '}
                {selectedProduct.activeIngredient}
              </p>
            )}

            {doseOverMax && selectedProduct && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p className="font-semibold">Aviso: dosis por encima del máximo de ejemplo</p>
                <p className="mt-1">
                  Has puesto {doseRaw} {doseUnit}; el máximo de ejemplo es {selectedProduct.maxDose}{' '}
                  {selectedProduct.unit}. Puedes continuar si es correcto según la etiqueta.
                </p>
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Aplicador *</span>
              <input
                type="text"
                value={applicator}
                onChange={(e) => {
                  setApplicator(e.target.value)
                  setShowErrors(false)
                }}
                placeholder="Nombre y apellidos del aplicador"
                autoComplete="name"
                className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Método de aplicación *</span>
              <select
                value={applicationMethod}
                onChange={(e) => setApplicationMethod(e.target.value as ApplicationMethod)}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              >
                {APPLICATION_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Plazo de seguridad (días) *</span>
              <input
                type="text"
                inputMode="numeric"
                value={safetyDays}
                onChange={(e) => setSafetyDays(e.target.value)}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Observaciones</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Motivo del tratamiento, plaga, condiciones…"
                className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              />
            </label>

            {showErrors && errors.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-950">Revisa estos campos:</p>
                {errors.map((w) => (
                  <p key={w.message} className="text-sm text-amber-900">
                    · {w.message}
                  </p>
                ))}
              </div>
            )}
            {!showErrors && softWarnings.length > 0 && (
              <ul className="space-y-2">
                {softWarnings.map((w) => (
                  <li key={w.message} className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {w.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-ink">Confirmación</h2>
              <p className="mt-1 text-sm text-muted">
                Al guardar, el registro queda en el historial y no se podrá modificar.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-line bg-white">
              <div className="border-b border-line bg-brand-muted px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Resumen SIEX</p>
                <p className="mt-1 text-lg font-semibold text-ink">
                  {useUnknown ? unknownName : selectedProduct?.name}
                </p>
                <p className="text-sm text-muted">
                  Reg.{' '}
                  {useUnknown
                    ? unknownReg || 'SIN-REGISTRO'
                    : selectedProduct?.registrationNumber}
                </p>
              </div>
              <dl className="divide-y divide-line text-sm">
                {[
                  ['Fecha', formatDate(date)],
                  [
                    'Parcelas',
                    parcelIds.map((id) => getParcelById(id)?.name).join(', '),
                  ],
                  ['Superficie', `${treatedAreaHa} ha`],
                  ['Cultivo', crop],
                  [
                    'Materia activa',
                    useUnknown ? unknownActive || '—' : selectedProduct?.activeIngredient,
                  ],
                  ['Dosis', `${doseRaw} ${doseUnit}`],
                  ['Aplicador', applicator],
                  ['Método', methodLabel(applicationMethod)],
                  ['Plazo seguridad', `${safetyDays || 0} días`],
                  ['Observaciones', notes || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-5 py-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {softWarnings.length > 0 && (
              <ul className="space-y-2">
                {softWarnings.map((w) => (
                  <li key={w.message} className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {w.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 border-t border-line bg-white/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
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
            className="flex-1 rounded-2xl bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-light disabled:opacity-60"
          >
            {saving ? 'Guardando…' : step === 3 ? 'Confirmar y guardar' : 'Continuar'}
          </button>
        </div>
      </footer>
    </div>
  )
}
