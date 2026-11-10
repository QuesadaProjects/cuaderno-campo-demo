import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  STORAGE_KEY,
  initialFertilizations,
  initialParcels,
  initialTreatments,
} from '../data/sampleData'
import type {
  FieldRecord,
  FertilizationRecord,
  Parcel,
  TreatmentRecord,
} from '../types'

interface PersistedState {
  parcels: Parcel[]
  records: FieldRecord[]
}

interface AppContextValue {
  parcels: Parcel[]
  records: FieldRecord[]
  treatments: TreatmentRecord[]
  fertilizations: FertilizationRecord[]
  addTreatment: (record: Omit<TreatmentRecord, 'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'>) => void
  addFertilization: (
    record: Omit<FertilizationRecord, 'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'>,
  ) => void
  markSentToSiex: (ids: string[]) => void
  addParcel: (
    parcel: Omit<Parcel, 'id' | 'coordinates' | 'color'> & {
      color?: string
      coordinates?: [number, number][]
    },
  ) => Parcel
  updateParcel: (id: string, patch: Partial<Omit<Parcel, 'id' | 'coordinates'>>) => void
  getParcelById: (id: string) => Parcel | undefined
  premiumOpen: boolean
  openPremium: (reason?: string) => void
  closePremium: () => void
  premiumReason: string
}

const AppContext = createContext<AppContextValue | null>(null)

function normalizeRecords(records: FieldRecord[]): FieldRecord[] {
  return records.map((r) => {
    if (r.type !== 'fertilizacion') return r
    const legacy = r as FertilizationRecord & { parcelId?: string }
    const parcelIds =
      legacy.parcelIds?.length
        ? legacy.parcelIds
        : legacy.parcelId
          ? [legacy.parcelId]
          : []
    return {
      ...legacy,
      parcelIds,
      treatedAreaHa: legacy.treatedAreaHa > 0 ? legacy.treatedAreaHa : 0,
    }
  })
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        parcels: initialParcels,
        records: [...initialTreatments, ...initialFertilizations],
      }
    }
    const parsed = JSON.parse(raw) as PersistedState
    if (!Array.isArray(parsed.parcels) || !Array.isArray(parsed.records)) {
      throw new Error('estado inválido')
    }
    return {
      parcels: parsed.parcels,
      records: normalizeRecords(parsed.records),
    }
  } catch {
    return {
      parcels: initialParcels,
      records: [...initialTreatments, ...initialFertilizations],
    }
  }
}

const DEFAULT_COORDS: [number, number][] = [
  [38.0, -3.38],
  [38.0, -3.375],
  [37.996, -3.375],
  [37.996, -3.38],
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [parcels, setParcels] = useState<Parcel[]>(() => loadState().parcels)
  const [records, setRecords] = useState<FieldRecord[]>(() => loadState().records)
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [premiumReason, setPremiumReason] = useState(
    'Desbloquea control de costes y multi-usuario',
  )

  useEffect(() => {
    const payload: PersistedState = { parcels, records }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [parcels, records])

  const addTreatment = useCallback(
    (
      record: Omit<TreatmentRecord, 'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'>,
    ) => {
      const full: TreatmentRecord = {
        ...record,
        id: `t${Date.now()}`,
        type: 'tratamiento',
        createdAt: new Date().toISOString(),
        sentToSiex: false,
      }
      // Historial append-only: nunca se edita ni borra un registro
      setRecords((prev) => [full, ...prev])
    },
    [],
  )

  const addFertilization = useCallback(
    (
      record: Omit<FertilizationRecord, 'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'>,
    ) => {
      const full: FertilizationRecord = {
        ...record,
        id: `f${Date.now()}`,
        type: 'fertilizacion',
        createdAt: new Date().toISOString(),
        sentToSiex: false,
      }
      setRecords((prev) => [full, ...prev])
    },
    [],
  )

  const markSentToSiex = useCallback((ids: string[]) => {
    const now = new Date().toISOString()
    setRecords((prev) =>
      prev.map((r) =>
        ids.includes(r.id) && !r.sentToSiex
          ? { ...r, sentToSiex: true, sentToSiexAt: now }
          : r,
      ),
    )
  }, [])

  const addParcel = useCallback(
    (
      input: Omit<Parcel, 'id' | 'coordinates' | 'color'> & {
        color?: string
        coordinates?: [number, number][]
      },
    ) => {
      const colors = ['#16a34a', '#65a30d', '#ca8a04', '#059669', '#0d9488', '#2563eb']
      const offset = parcels.length * 0.004
      const parcel: Parcel = {
        id: `p${Date.now()}`,
        name: input.name,
        crop: input.crop,
        hectares: input.hectares,
        sigpacRef: input.sigpacRef,
        color: input.color ?? colors[parcels.length % colors.length],
        coordinates:
          input.coordinates ??
          DEFAULT_COORDS.map(
            ([lat, lng]) => [lat + offset, lng + offset] as [number, number],
          ),
      }
      setParcels((prev) => [...prev, parcel])
      return parcel
    },
    [parcels.length],
  )

  const updateParcel = useCallback(
    (id: string, patch: Partial<Omit<Parcel, 'id' | 'coordinates'>>) => {
      setParcels((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    },
    [],
  )

  const getParcelById = useCallback(
    (id: string) => parcels.find((p) => p.id === id),
    [parcels],
  )

  const openPremium = useCallback((reason?: string) => {
    if (reason) setPremiumReason(reason)
    setPremiumOpen(true)
  }, [])

  const closePremium = useCallback(() => setPremiumOpen(false), [])

  const treatments = useMemo(
    () => records.filter((r): r is TreatmentRecord => r.type === 'tratamiento'),
    [records],
  )
  const fertilizations = useMemo(
    () => records.filter((r): r is FertilizationRecord => r.type === 'fertilizacion'),
    [records],
  )

  const value = useMemo(
    () => ({
      parcels,
      records,
      treatments,
      fertilizations,
      addTreatment,
      addFertilization,
      markSentToSiex,
      addParcel,
      updateParcel,
      getParcelById,
      premiumOpen,
      openPremium,
      closePremium,
      premiumReason,
    }),
    [
      parcels,
      records,
      treatments,
      fertilizations,
      addTreatment,
      addFertilization,
      markSentToSiex,
      addParcel,
      updateParcel,
      getParcelById,
      premiumOpen,
      openPremium,
      closePremium,
      premiumReason,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
