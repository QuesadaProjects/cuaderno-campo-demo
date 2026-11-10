import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ParcelMap } from '../components/ParcelMap'
import { useApp } from '../context/AppContext'
import { fertParcelIds } from '../data/sampleData'

export function Parcels() {
  const { parcels, records, updateParcel, openPremium } = useApp()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    crop: '',
    hectares: '',
    sigpacRef: '',
  })

  const totalHa = parcels.reduce((s, p) => s + p.hectares, 0)

  const openEdit = (id: string) => {
    const p = parcels.find((x) => x.id === id)
    if (!p) return
    setEditingId(id)
    setForm({
      name: p.name,
      crop: p.crop,
      hectares: String(p.hectares),
      sigpacRef: p.sigpacRef ?? '',
    })
  }

  const saveEdit = async () => {
    const hectares = Number(form.hectares.replace(',', '.'))
    if (!editingId || !form.name.trim() || !form.crop.trim() || !(hectares > 0)) {
      window.alert('Completa nombre, cultivo y hectáreas válidas.')
      return
    }
    try {
      await updateParcel(editingId, {
        name: form.name.trim(),
        crop: form.crop.trim(),
        hectares,
        sigpacRef: form.sigpacRef.trim() || undefined,
      })
      setEditingId(null)
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'No se pudo actualizar la parcela en Supabase',
      )
    }
  }

  return (
    <div className="animate-fade-up px-5 pt-6 pb-4">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Parcelas</h1>
          <p className="mt-1 text-sm text-muted">
            {parcels.length} parcelas · {totalHa} ha · límite gratis 40 ha
          </p>
        </div>
        <Link
          to="/parcelas/nueva"
          className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white"
        >
          + Nueva parcela
        </Link>
      </header>

      <ParcelMap height="h-48" />

      <Link
        to="/parcelas/nueva"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand/40 bg-brand-muted/50 py-3.5 text-sm font-semibold text-brand"
      >
        + Añadir parcela por referencia SIGPAC
      </Link>

      {editingId && (
        <div className="mt-4 space-y-3 rounded-2xl border border-brand/30 bg-brand-muted/40 p-4">
          <p className="text-sm font-semibold text-ink">Editar parcela</p>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nombre"
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
          />
          <input
            value={form.crop}
            onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
            placeholder="Cultivo"
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
          />
          <input
            value={form.hectares}
            onChange={(e) => setForm((f) => ({ ...f, hectares: e.target.value }))}
            placeholder="Hectáreas"
            inputMode="decimal"
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
          />
          <input
            value={form.sigpacRef}
            onChange={(e) => setForm((f) => ({ ...f, sigpacRef: e.target.value }))}
            placeholder="Ref. SIGPAC (opcional)"
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {parcels.map((parcel) => {
          const count = records.filter((a) =>
            a.type === 'tratamiento'
              ? a.parcelIds.includes(parcel.id)
              : fertParcelIds(a).includes(parcel.id),
          ).length
          return (
            <li key={parcel.id} className="rounded-2xl border border-line bg-white">
              <Link
                to={`/parcelas/${parcel.id}`}
                className="flex items-center gap-4 px-4 py-4"
              >
                <span
                  className="h-12 w-12 shrink-0 rounded-xl"
                  style={{
                    backgroundColor: `${parcel.color}22`,
                    border: `2px solid ${parcel.color}`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{parcel.name}</p>
                  <p className="text-sm text-muted">
                    {parcel.crop} · {parcel.hectares} ha · {count} registros
                  </p>
                  {parcel.sigpacRef && (
                    <p className="text-xs text-slate-400">SIGPAC {parcel.sigpacRef}</p>
                  )}
                </div>
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.5 13 10l-5.5 5.5" />
                </svg>
              </Link>
              <div className="border-t border-line px-4 py-2">
                <button
                  type="button"
                  onClick={() => openEdit(parcel.id)}
                  className="text-sm font-medium text-brand"
                >
                  Editar datos
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() =>
          openPremium('El plan gratis incluye hasta 2 usuarios. Añade más con Premium.')
        }
        className="mt-5 w-full rounded-2xl border border-line bg-surface py-3.5 text-sm font-semibold text-ink"
      >
        + Añadir usuario a la explotación
      </button>
    </div>
  )
}
