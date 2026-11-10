import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
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
    const raf = requestAnimationFrame(() => map.invalidateSize())
    const targets = ids?.length ? parcels.filter((p) => ids.includes(p.id)) : parcels
    const all = targets.flatMap((p) => p.coordinates)
    if (all.length === 0) return () => cancelAnimationFrame(raf)
    const bounds = L.latLngBounds(all as LatLngExpression[])
    map.fitBounds(bounds as LatLngBoundsExpression, { padding: [28, 28] })
    return () => cancelAnimationFrame(raf)
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

  return (
    <div className={`${height} w-full overflow-hidden rounded-2xl border border-line shadow-sm`}>
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
