import { supabase } from './supabase'
import type {
  ApplicationMethod,
  DoseUnit,
  FertilizationRecord,
  Parcel,
  TreatmentRecord,
} from '../types'

export interface ExplotacionRow {
  id: string
  user_id: string
  nombre: string
  created_at: string
}

export interface ParcelaRow {
  id: string
  explotacion_id: string
  nombre: string
  cultivo: string
  superficie_ha: number
  referencia_sigpac: string | null
  created_at: string
}

export interface TratamientoRow {
  id: string
  parcela_id: string
  fecha: string
  producto: string
  numero_registro: string
  materia_activa: string
  dosis: number
  unidad: string
  aplicador: string
  plazo_seguridad: number
  metodo: string
  observaciones: string | null
  superficie_tratada: number
  enviado_siex: boolean
  created_at: string
}

export interface FertilizacionRow {
  id: string
  parcela_id: string
  fecha: string
  fertilizante: string
  tipo: string
  dosis: number
  unidad: string
  n: number | null
  p: number | null
  k: number | null
  aplicador: string
  observaciones: string | null
  superficie: number
  enviado_siex: boolean
  created_at: string
}

const PARCEL_COLORS = ['#16a34a', '#65a30d', '#ca8a04', '#059669', '#0d9488', '#2563eb']

function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h
}

/** Coordenadas/color locales: la tabla parcelas no guarda geometría */
export function parcelVisuals(
  id: string,
  index = 0,
): { color: string; coordinates: [number, number][] } {
  const h = hashString(id)
  const baseLat = 38.012 + ((h % 50) - 25) * 0.00035 + index * 0.0035
  const baseLng = -3.372 + (((h >> 5) % 50) - 25) * 0.0004 + index * 0.0025
  const w = 0.003 + (h % 10) * 0.00015
  const ht = 0.0025 + ((h >> 2) % 10) * 0.00012

  return {
    color: PARCEL_COLORS[h % PARCEL_COLORS.length]!,
    coordinates: [
      [baseLat + ht, baseLng - w],
      [baseLat + ht, baseLng + w],
      [baseLat - ht, baseLng + w],
      [baseLat - ht, baseLng - w],
    ],
  }
}

export function mapParcela(row: ParcelaRow, index: number): Parcel {
  const visuals = parcelVisuals(row.id, index)
  return {
    id: row.id,
    name: row.nombre,
    crop: row.cultivo,
    hectares: Number(row.superficie_ha),
    sigpacRef: row.referencia_sigpac ?? undefined,
    color: visuals.color,
    coordinates: visuals.coordinates,
  }
}

export function mapTratamiento(
  row: TratamientoRow,
  parcelCrop?: string,
): TreatmentRecord {
  return {
    id: row.id,
    type: 'tratamiento',
    createdAt: row.created_at,
    date: row.fecha,
    parcelIds: [row.parcela_id],
    treatedAreaHa: Number(row.superficie_tratada),
    crop: parcelCrop || '—',
    productId: row.numero_registro || 'db',
    productName: row.producto,
    registrationNumber: row.numero_registro,
    activeIngredient: row.materia_activa,
    dose: Number(row.dosis),
    doseUnit: (row.unidad as DoseUnit) || 'l/ha',
    applicator: row.aplicador,
    safetyDays: Number(row.plazo_seguridad) || 0,
    applicationMethod: (row.metodo as ApplicationMethod) || 'otros',
    notes: row.observaciones ?? undefined,
    sentToSiex: Boolean(row.enviado_siex),
  }
}

export function mapFertilizacion(row: FertilizacionRow): FertilizationRecord {
  return {
    id: row.id,
    type: 'fertilizacion',
    createdAt: row.created_at,
    date: row.fecha,
    parcelIds: [row.parcela_id],
    treatedAreaHa: Number(row.superficie),
    fertilizerName: row.fertilizante,
    fertilizerType: row.tipo,
    dose: Number(row.dosis),
    doseUnit: (row.unidad as 'kg/ha' | 'l/ha') || 'kg/ha',
    n: row.n == null ? undefined : Number(row.n),
    p: row.p == null ? undefined : Number(row.p),
    k: row.k == null ? undefined : Number(row.k),
    applicator: row.aplicador,
    notes: row.observaciones ?? undefined,
    sentToSiex: Boolean(row.enviado_siex),
  }
}

export async function ensureExplotacion(
  userId: string,
  email?: string | null,
): Promise<ExplotacionRow> {
  const { data: existing, error: selectError } = await supabase
    .from('explotaciones')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing) return existing as ExplotacionRow

  const localPart = email?.split('@')[0]?.trim()
  const nombre = localPart
    ? `Explotación de ${localPart}`
    : 'Mi explotación'

  const { data: created, error: insertError } = await supabase
    .from('explotaciones')
    .insert({ user_id: userId, nombre })
    .select('*')
    .single()

  if (insertError) throw insertError
  return created as ExplotacionRow
}

export async function fetchParcelas(explotacionId: string): Promise<Parcel[]> {
  const { data, error } = await supabase
    .from('parcelas')
    .select('*')
    .eq('explotacion_id', explotacionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return ((data ?? []) as ParcelaRow[]).map(mapParcela)
}

export async function insertParcela(
  explotacionId: string,
  input: {
    name: string
    crop: string
    hectares: number
    sigpacRef?: string
  },
): Promise<Parcel> {
  const { data, error } = await supabase
    .from('parcelas')
    .insert({
      explotacion_id: explotacionId,
      nombre: input.name,
      cultivo: input.crop,
      superficie_ha: input.hectares,
      referencia_sigpac: input.sigpacRef ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return mapParcela(data as ParcelaRow, 0)
}

export async function patchParcela(
  id: string,
  patch: Partial<Pick<Parcel, 'name' | 'crop' | 'hectares' | 'sigpacRef'>>,
): Promise<void> {
  const payload: Record<string, unknown> = {}
  if (patch.name !== undefined) payload.nombre = patch.name
  if (patch.crop !== undefined) payload.cultivo = patch.crop
  if (patch.hectares !== undefined) payload.superficie_ha = patch.hectares
  if (patch.sigpacRef !== undefined) payload.referencia_sigpac = patch.sigpacRef || null

  const { error } = await supabase.from('parcelas').update(payload).eq('id', id)
  if (error) throw error
}

export async function fetchTratamientos(
  parcelaIds: string[],
  parcelCropById: Record<string, string>,
): Promise<TreatmentRecord[]> {
  if (parcelaIds.length === 0) return []
  const { data, error } = await supabase
    .from('tratamientos')
    .select('*')
    .in('parcela_id', parcelaIds)
    .order('fecha', { ascending: false })

  if (error) throw error
  return ((data ?? []) as TratamientoRow[]).map((row) =>
    mapTratamiento(row, parcelCropById[row.parcela_id]),
  )
}

export async function fetchFertilizaciones(
  parcelaIds: string[],
): Promise<FertilizationRecord[]> {
  if (parcelaIds.length === 0) return []
  const { data, error } = await supabase
    .from('fertilizaciones')
    .select('*')
    .in('parcela_id', parcelaIds)
    .order('fecha', { ascending: false })

  if (error) throw error
  return ((data ?? []) as FertilizacionRow[]).map(mapFertilizacion)
}

export async function insertTratamientosForParcels(
  input: Omit<TreatmentRecord, 'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'>,
  parcels: Parcel[],
): Promise<TreatmentRecord[]> {
  const selected = parcels.filter((p) => input.parcelIds.includes(p.id))
  if (selected.length === 0) throw new Error('Selecciona al menos una parcela')

  const totalHa = selected.reduce((s, p) => s + p.hectares, 0)
  const rows = selected.map((parcel) => {
    const share =
      totalHa > 0
        ? (input.treatedAreaHa * parcel.hectares) / totalHa
        : input.treatedAreaHa / selected.length
    return {
      parcela_id: parcel.id,
      fecha: input.date,
      producto: input.productName,
      numero_registro: input.registrationNumber,
      materia_activa: input.activeIngredient,
      dosis: input.dose,
      unidad: input.doseUnit,
      aplicador: input.applicator,
      plazo_seguridad: input.safetyDays,
      metodo: input.applicationMethod,
      observaciones: input.notes ?? null,
      superficie_tratada: Math.round(share * 1000) / 1000,
      enviado_siex: false,
    }
  })

  const { data, error } = await supabase.from('tratamientos').insert(rows).select('*')
  if (error) throw error

  return ((data ?? []) as TratamientoRow[]).map((row) => {
    const crop =
      selected.find((p) => p.id === row.parcela_id)?.crop ?? input.crop
    return mapTratamiento(row, crop)
  })
}

export async function insertFertilizacionesForParcels(
  input: Omit<
    FertilizationRecord,
    'id' | 'createdAt' | 'type' | 'sentToSiex' | 'sentToSiexAt'
  >,
  parcels: Parcel[],
): Promise<FertilizationRecord[]> {
  const selected = parcels.filter((p) => input.parcelIds.includes(p.id))
  if (selected.length === 0) throw new Error('Selecciona al menos una parcela')

  const totalHa = selected.reduce((s, p) => s + p.hectares, 0)
  const rows = selected.map((parcel) => {
    const share =
      totalHa > 0
        ? (input.treatedAreaHa * parcel.hectares) / totalHa
        : input.treatedAreaHa / selected.length
    return {
      parcela_id: parcel.id,
      fecha: input.date,
      fertilizante: input.fertilizerName,
      tipo: input.fertilizerType,
      dosis: input.dose,
      unidad: input.doseUnit,
      n: input.n ?? null,
      p: input.p ?? null,
      k: input.k ?? null,
      aplicador: input.applicator,
      observaciones: input.notes ?? null,
      superficie: Math.round(share * 1000) / 1000,
      enviado_siex: false,
    }
  })

  const { data, error } = await supabase.from('fertilizaciones').insert(rows).select('*')
  if (error) throw error
  return ((data ?? []) as FertilizacionRow[]).map(mapFertilizacion)
}

export async function markRecordsSentToSiex(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const [{ error: tError }, { error: fError }] = await Promise.all([
    supabase.from('tratamientos').update({ enviado_siex: true }).in('id', ids),
    supabase.from('fertilizaciones').update({ enviado_siex: true }).in('id', ids),
  ])
  if (tError) throw tError
  if (fError) throw fError
}
