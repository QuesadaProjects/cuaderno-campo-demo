import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useApp } from '../context/AppContext'
import { isValidSigpacFormat, normalizeSigpacRef, resolveSigpacDemo } from '../lib/sigpac'

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:999px;background:#16a34a;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function MapClickCapture({
  onPick,
}: {
  onPick: (latlng: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng)
    },
  })
  return null
}

export function NewParcel() {
  const navigate = useNavigate()
  const { parcels, addParcel } = useApp()
  const [sigpacRef, setSigpacRef] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ id: string; name: string; ref: string } | null>(null)
  const [drawMode, setDrawMode] = useState(false)
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null)

  const handleAddBySigpac = () => {
    const ref = normalizeSigpacRef(sigpacRef)
    if (!ref) {
      setError('Introduce una referencia SIGPAC')
      return
    }
    if (!isValidSigpacFormat(ref)) {
      setError('Formato no válido. Usa algo como 23:097:0001:00001')
      return
    }
    if (parcels.some((p) => (p.sigpacRef ?? '').toUpperCase() === ref)) {
      setError('Ya tienes una parcela con esa referencia SIGPAC')
      return
    }

    setError(null)
    setLoading(true)

    void (async () => {
      try {
        // Breve delay para simular la consulta SIGPAC en demo
        await new Promise((r) => window.setTimeout(r, 400))
        const data = resolveSigpacDemo(ref, parcels.length)
        const created = await addParcel(data)
        setSuccess({ id: created.id, name: created.name, ref: created.sigpacRef ?? ref })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'No se pudo guardar la parcela en Supabase',
        )
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleAddByPin = () => {
    if (!pin) {
      setError('Toca el mapa para marcar la ubicación de la parcela')
      return
    }
    setError(null)
    setLoading(true)
    void (async () => {
      try {
        const w = 0.0025
        const h = 0.002
        const created = await addParcel({
          name: `Parcela mapa ${parcels.length + 1}`,
          crop: 'Olivar',
          hectares: 3.5,
          sigpacRef: undefined,
          color: '#0d9488',
          coordinates: [
            [pin.lat + h, pin.lng - w],
            [pin.lat + h, pin.lng + w],
            [pin.lat - h, pin.lng + w],
            [pin.lat - h, pin.lng - w],
          ],
        })
        setSuccess({
          id: created.id,
          name: created.name,
          ref: 'Ubicación marcada en mapa',
        })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'No se pudo guardar la parcela en Supabase',
        )
      } finally {
        setLoading(false)
      }
    })()
  }

  if (success) {
    return (
      <div className="animate-fade-up flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl text-white">
          ✓
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Parcela añadida</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{success.name}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          {success.ref.startsWith('Ubicación')
            ? success.ref
            : `Referencia SIGPAC ${success.ref}`}
          . Ya puedes usarla para registrar tratamientos y fertilizaciones.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate(`/parcelas/${success.id}`)}
            className="rounded-2xl bg-brand py-3.5 font-semibold text-white"
          >
            Ver parcela
          </button>
          <button
            type="button"
            onClick={() => navigate('/registrar/tratamiento', { state: { parcelId: success.id } })}
            className="rounded-2xl border border-line bg-surface py-3.5 font-semibold text-ink"
          >
            Registrar tratamiento
          </button>
          <button
            type="button"
            onClick={() => navigate('/parcelas')}
            className="py-2 text-sm font-medium text-muted"
          >
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up px-5 pt-5 pb-8">
      <header className="mb-6 flex items-center gap-3">
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
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Nueva parcela</h1>
          <p className="text-sm text-muted">Alta por referencia SIGPAC</p>
        </div>
      </header>

      {!drawMode ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-line bg-white p-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Referencia SIGPAC
              </span>
              <input
                value={sigpacRef}
                onChange={(e) => {
                  setSigpacRef(e.target.value)
                  setError(null)
                }}
                placeholder="23:097:0001:00001"
                autoComplete="off"
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
              />
            </label>

            <div className="mt-4 rounded-2xl bg-brand-muted/70 px-4 py-3 text-sm leading-relaxed text-ink">
              <p className="font-semibold text-brand">¿Qué es la referencia SIGPAC?</p>
              <p className="mt-1 text-muted">
                Es el código oficial que identifica cada recinto agrícola en España (provincia,
                municipio, polígono y parcela). Lo encuentras en tu expediente de la PAC o en el
                visor SIGPAC. En esta demo, al buscarlo se generan datos de ejemplo realistas.
              </p>
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleAddBySigpac}
              className="mt-5 w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Buscando en SIGPAC…' : 'Buscar / Añadir'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setDrawMode(true)
              setError(null)
            }}
            className="w-full rounded-2xl border border-dashed border-brand/40 bg-brand-muted/40 py-3.5 text-sm font-semibold text-brand"
          >
            Dibujar en el mapa
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-4">
            <p className="text-sm font-semibold text-ink">Marca un punto en el mapa</p>
            <p className="mt-1 text-sm text-muted">
              Toca el mapa para situar la parcela. Se creará un recinto de ejemplo alrededor del
              punto.
            </p>
            <div className="mt-3 h-56 overflow-hidden rounded-2xl border border-line">
              <MapContainer
                center={[38.01, -3.37]}
                zoom={13}
                className="h-full w-full"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <MapClickCapture onPick={(ll) => setPin({ lat: ll.lat, lng: ll.lng })} />
                {pin && <Marker position={[pin.lat, pin.lng]} icon={pinIcon} />}
              </MapContainer>
            </div>
            {pin && (
              <p className="mt-2 text-xs text-muted">
                Punto marcado: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
              </p>
            )}
            {error && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDrawMode(false)
                  setPin(null)
                  setError(null)
                }}
                className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-slate-600"
              >
                Volver a SIGPAC
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleAddByPin}
                className="flex-1 rounded-2xl bg-brand py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Creando…' : 'Añadir parcela'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
