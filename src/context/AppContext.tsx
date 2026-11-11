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
  ensureExplotacion,
  fetchFertilizaciones,
  fetchParcelas,
  fetchTratamientos,
  insertFertilizacionesForParcels,
  insertParcela,
  insertTratamientosForParcels,
  markRecordsSentToSiex,
  patchParcela,
  type ExplotacionRow,
} from '../lib/supabaseData'
import type {
  FieldRecord,
  FertilizationRecord,
  Parcel,
  TreatmentRecord,
} from '../types'
import { useAuth } from './AuthContext'

interface AppContextValue {
  ready: boolean
  loadingError: string | null
  farmName: string
  explotacionId: string | null
  parcels: Parcel[]
  records: FieldRecord[]
  treatments: TreatmentRecord[]
  fertilizations: FertilizationRecord[]
  addTreatment: (
    record: Omit<TreatmentRecord, 'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'>,
  ) => Promise<void>
  addFertilization: (
    record: Omit<
      FertilizationRecord,
      'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'
    >,
  ) => Promise<void>
  markSentToSiex: (ids: string[]) => Promise<void>
  addParcel: (
    parcel: Omit<Parcel, 'id' | 'coordinates' | 'color'> & {
      color?: string
      coordinates?: [number, number][]
    },
  ) => Promise<Parcel>
  updateParcel: (
    id: string,
    patch: Partial<Omit<Parcel, 'id' | 'coordinates'>>,
  ) => Promise<void>
  refreshData: () => Promise<void>
  getParcelById: (id: string) => Parcel | undefined
  premiumOpen: boolean
  openPremium: (reason?: string) => void
  closePremium: () => void
  premiumReason: string
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [ready, setReady] = useState(!user)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [explotacion, setExplotacion] = useState<ExplotacionRow | null>(null)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [records, setRecords] = useState<FieldRecord[]>([])
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [premiumReason, setPremiumReason] = useState(
    'Desbloquea control de costes y multi-usuario',
  )

  const loadForUser = useCallback(async (userId: string, email?: string | null) => {
    setLoadingError(null)
    setReady(false)
    try {
      const exp = await ensureExplotacion(userId, email)
      setExplotacion(exp)

      const nextParcels = await fetchParcelas(exp.id)
      setParcels(nextParcels)

      const parcelIds = nextParcels.map((p) => p.id)
      const cropById = Object.fromEntries(nextParcels.map((p) => [p.id, p.crop]))
      const [treatments, fertilizations] = await Promise.all([
        fetchTratamientos(parcelIds, cropById),
        fetchFertilizaciones(parcelIds),
      ])

      const merged: FieldRecord[] = [...treatments, ...fertilizations].sort((a, b) =>
        b.date.localeCompare(a.date),
      )
      setRecords(merged)
    } catch (err) {
      console.error(err)
      setLoadingError(
        err instanceof Error ? err.message : 'No se pudieron cargar los datos de Supabase',
      )
      setExplotacion(null)
      setParcels([])
      setRecords([])
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setExplotacion(null)
      setParcels([])
      setRecords([])
      setLoadingError(null)
      setReady(true)
      return
    }
    void loadForUser(user.id, user.email)
  }, [user, loadForUser])

  const refreshData = useCallback(async () => {
    if (!user) return
    await loadForUser(user.id, user.email)
  }, [user, loadForUser])

  const addTreatment = useCallback(
    async (
      record: Omit<TreatmentRecord, 'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'>,
    ) => {
      const created = await insertTratamientosForParcels(record, parcels)
      setRecords((prev) => [...created, ...prev])
    },
    [parcels],
  )

  const addFertilization = useCallback(
    async (
      record: Omit<
        FertilizationRecord,
        'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'
      >,
    ) => {
      const created = await insertFertilizacionesForParcels(record, parcels)
      setRecords((prev) => [...created, ...prev])
    },
    [parcels],
  )

  const markSentToSiex = useCallback(
    async (ids: string[]) => {
      const items = records
        .filter((r) => ids.includes(r.id))
        .map((r) => ({ id: r.id, type: r.type }))
      if (items.length === 0) return

      await markRecordsSentToSiex(items)

      const now = new Date().toISOString()
      setRecords((prev) =>
        prev.map((r) =>
          ids.includes(r.id) && !r.sentToSiex
            ? { ...r, sentToSiex: true, sentToSiexAt: now }
            : r,
        ),
      )
    },
    [records],
  )

  const addParcel = useCallback(
    async (
      input: Omit<Parcel, 'id' | 'coordinates' | 'color'> & {
        color?: string
        coordinates?: [number, number][]
      },
    ) => {
      if (!explotacion) throw new Error('No hay explotación activa')
      const created = await insertParcela(explotacion.id, {
        name: input.name,
        crop: input.crop,
        hectares: input.hectares,
        sigpacRef: input.sigpacRef,
      })
      // Conserva coords/color del flujo SIGPAC/mapa si vienen del cliente
      const parcel: Parcel = {
        ...created,
        color: input.color ?? created.color,
        coordinates: input.coordinates ?? created.coordinates,
      }
      setParcels((prev) => [...prev, parcel])
      return parcel
    },
    [explotacion],
  )

  const updateParcel = useCallback(
    async (id: string, patch: Partial<Omit<Parcel, 'id' | 'coordinates'>>) => {
      await patchParcela(id, patch)
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
      ready,
      loadingError,
      farmName: explotacion?.nombre ?? 'Mi explotación',
      explotacionId: explotacion?.id ?? null,
      parcels,
      records,
      treatments,
      fertilizations,
      addTreatment,
      addFertilization,
      markSentToSiex,
      addParcel,
      updateParcel,
      refreshData,
      getParcelById,
      premiumOpen,
      openPremium,
      closePremium,
      premiumReason,
    }),
    [
      ready,
      loadingError,
      explotacion,
      parcels,
      records,
      treatments,
      fertilizations,
      addTreatment,
      addFertilization,
      markSentToSiex,
      addParcel,
      updateParcel,
      refreshData,
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
