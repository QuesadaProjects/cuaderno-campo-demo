import type {
  FertilizerProduct,
  PhytosanitaryProduct,
  TreatmentRecord,
} from '../types'

/** Catálogo local de productos (referencia para el formulario; no es la BD) */
export const phytosanitaryProducts: PhytosanitaryProduct[] = [
  {
    id: 'fit1',
    name: 'Roundup UltraPlus',
    registrationNumber: 'ES-24567',
    activeIngredient: 'Glifosato 360 g/l',
    type: 'herbicida',
    defaultDose: 3,
    unit: 'l/ha',
    maxDose: 6,
    safetyDays: 7,
  },
  {
    id: 'fit2',
    name: 'Cuprocol',
    registrationNumber: 'ES-18234',
    activeIngredient: 'Oxicloruro de cobre 50%',
    type: 'fungicida',
    defaultDose: 2,
    unit: 'kg/ha',
    maxDose: 4,
    safetyDays: 14,
  },
  {
    id: 'fit3',
    name: 'Karate Zeon',
    registrationNumber: 'ES-20156',
    activeIngredient: 'Lambda-cihalotrin 100 g/l',
    type: 'insecticida',
    defaultDose: 0.075,
    unit: 'l/ha',
    maxDose: 0.15,
    safetyDays: 7,
  },
  {
    id: 'fit4',
    name: 'Score 25 EC',
    registrationNumber: 'ES-16789',
    activeIngredient: 'Difenoconazol 250 g/l',
    type: 'fungicida',
    defaultDose: 0.3,
    unit: 'l/ha',
    maxDose: 0.5,
    safetyDays: 21,
  },
  {
    id: 'fit5',
    name: 'Systhane Forte',
    registrationNumber: 'ES-15432',
    activeIngredient: 'Myclobutanil 240 g/l',
    type: 'fungicida',
    defaultDose: 0.2,
    unit: 'l/ha',
    maxDose: 0.4,
    safetyDays: 14,
  },
  {
    id: 'fit6',
    name: 'Decis Expert',
    registrationNumber: 'ES-19876',
    activeIngredient: 'Deltametrina 25 g/l',
    type: 'insecticida',
    defaultDose: 0.3,
    unit: 'l/ha',
    maxDose: 0.5,
    safetyDays: 7,
  },
  {
    id: 'fit7',
    name: 'Folpan 80 WDG',
    registrationNumber: 'ES-13201',
    activeIngredient: 'Folpet 80%',
    type: 'fungicida',
    defaultDose: 1.5,
    unit: 'kg/ha',
    maxDose: 2.5,
    safetyDays: 28,
  },
  {
    id: 'fit8',
    name: 'Stomp Aqua',
    registrationNumber: 'ES-22110',
    activeIngredient: 'Pendimetalina 455 g/l',
    type: 'herbicida',
    defaultDose: 2.5,
    unit: 'l/ha',
    maxDose: 4,
    safetyDays: 90,
  },
]

export const fertilizerProducts: FertilizerProduct[] = [
  {
    id: 'fer1',
    name: 'Nitrato amónico 27%',
    fertilizerType: 'Nitrogenado',
    n: 27,
    p: 0,
    k: 0,
    defaultDose: 200,
    unit: 'kg/ha',
  },
  {
    id: 'fer2',
    name: 'Abono NPK 15-15-15',
    fertilizerType: 'Complejo NPK',
    n: 15,
    p: 15,
    k: 15,
    defaultDose: 250,
    unit: 'kg/ha',
  },
  {
    id: 'fer3',
    name: 'Sulfato potásico 50%',
    fertilizerType: 'Potásico',
    n: 0,
    p: 0,
    k: 50,
    defaultDose: 120,
    unit: 'kg/ha',
  },
  {
    id: 'fer4',
    name: 'Superfosfato 45%',
    fertilizerType: 'Fosfatado',
    n: 0,
    p: 45,
    k: 0,
    defaultDose: 150,
    unit: 'kg/ha',
  },
  {
    id: 'fer5',
    name: 'Urea 46%',
    fertilizerType: 'Nitrogenado',
    n: 46,
    p: 0,
    k: 0,
    defaultDose: 150,
    unit: 'kg/ha',
  },
]

/** Compatibilidad con registros antiguos */
export function fertParcelIds(record: {
  parcelIds?: string[]
  parcelId?: string
}): string[] {
  if (record.parcelIds?.length) return record.parcelIds
  if (record.parcelId) return [record.parcelId]
  return []
}

export const DEFAULT_APPLICATOR = ''
/** Marca de producto en pantallas públicas (login) */
export const APP_BRAND = 'CampoLibre'
/** @deprecated Usa farmName del contexto de app */
export const FARM_NAME = APP_BRAND
export const FARM_NIF = ''

export function getPhytoById(id: string) {
  return phytosanitaryProducts.find((p) => p.id === id)
}

export function getFertilizerById(id: string) {
  return fertilizerProducts.find((p) => p.id === id)
}

export function formatDate(iso: string) {
  return new Date(iso.includes('T') ? iso : iso + 'T12:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function daysUntilSafetyEnd(record: TreatmentRecord) {
  if (!record.safetyDays) return null
  const end = new Date(record.date + 'T12:00:00')
  end.setDate(end.getDate() + record.safetyDays)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isSafetyActive(record: TreatmentRecord) {
  const days = daysUntilSafetyEnd(record)
  return days !== null && days >= 0
}

export function methodLabel(value: string) {
  const map: Record<string, string> = {
    pulverizacion: 'Pulverización',
    atomizacion: 'Atomización',
    espolvoreo: 'Espolvoreo',
    tratamiento_semillas: 'Tratamiento de semillas',
    inyeccion: 'Inyección',
    riego: 'Aplicación en riego',
    otros: 'Otros',
  }
  return map[value] ?? value
}
