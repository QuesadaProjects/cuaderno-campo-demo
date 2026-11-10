import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet'
import L from 'leaflet'
import { useApp } from '../context/AppContext'
import type { Parcel } from '../types'

interface ParcelMapProps {
  selectedIds?: string[]
  onSelect?: (id: string) => void
  highlightId?: string
  height?: string
  interactive?: boolean
  parcelsOverride?: Parcel[]
}

function FitBounds({ parcels, ids }: { parcels: Parcel[]; ids?: string[] }) {
  const map = useMap()
  useEffect(() => {
    const resize = () => map.invalidateSize()
    const raf = requestAnimationFrame(resize)
    const t1 = window.setTimeout(resize, 120)
    const t2 = window.setTimeout(resize, 400)
    const targets = ids?.length ? parcels.filter((p) => ids.includes(p.id)) : parcels
    const all = targets.flatMap((p) => p.coordinates)
    if (all.length > 0) {
      const bounds = L.latLngBounds(all as LatLngExpression[])
      map.fitBounds(bounds as LatLngBoundsExpression, { padding: [28, 28] })
    }
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [map, parcels, ids])
  return null
}

export function ParcelMap({
  selectedIds = [],
  onSelect,
  highlightId,
  height = 'h-64',
  interactive = true,
  parcelsOverride,
}: ParcelMapProps) {
  const { parcels: ctxParcels } = useApp()
  const parcels = parcelsOverride ?? ctxParcels
  const [ready, setReady] = useState(false)
  const [tileError, setTileError] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 40)
    return () => window.clearTimeout(t)
  }, [])

  if (!ready) {
    return (
      <div
        className={`${height} flex w-full items-center justify-center rounded-2xl border border-line bg-brand-muted/40 text-sm text-muted`}
      >
        Cargando mapa…
      </div>
    )
  }

  if (parcels.length === 0) {
    return (
      <div
        className={`${height} flex w-full items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-muted`}
      >
        No hay parcelas para mostrar en el mapa
      </div>
    )
  }

  return (
    <div className={`relative ${height} w-full overflow-hidden rounded-2xl border border-line shadow-sm`}>
      {tileError && (
        <div className="absolute inset-x-3 top-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs text-amber-900 shadow">
          No se han podido cargar los mapas de OpenStreetMap. Comprueba la conexión; las parcelas
          siguen visibles.
        </div>
      )}
      <MapContainer
        center={[38.01, -3.37]}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={true}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
          eventHandlers={{
            tileerror: () => setTileError(true),
            load: () => setTileError(false),
          }}
        />
        <FitBounds parcels={parcels} ids={highlightId ? [highlightId] : undefined} />
        {parcels.map((parcel) => {
          const selected = selectedIds.includes(parcel.id) || highlightId === parcel.id
          return (
            <Polygon
              key={parcel.id}
              positions={parcel.coordinates}
              pathOptions={{
                color: parcel.color,
                weight: selected ? 3 : 1.5,
                fillColor: parcel.color,
                fillOpacity: selected ? 0.45 : 0.22,
              }}
              eventHandlers={{
                click: () => onSelect?.(parcel.id),
              }}
            >
              <Tooltip sticky className="parcel-tooltip">
                {parcel.name} · {parcel.hectares} ha
              </Tooltip>
            </Polygon>
          )
        })}
      </MapContainer>
    </div>
  )
}
