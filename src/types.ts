/** Tipos del cuaderno de campo compatible con requisitos SIEX (demo) */

export type PhytosanitaryType =
  | 'herbicida'
  | 'fungicida'
  | 'insecticida'
  | 'acaricida'
  | 'otros'

export type DoseUnit = 'l/ha' | 'kg/ha' | 'ml/hl' | 'g/hl'

export type ApplicationMethod =
  | 'pulverizacion'
  | 'atomizacion'
  | 'espolvoreo'
  | 'tratamiento_semillas'
  | 'inyeccion'
  | 'riego'
  | 'otros'

export const APPLICATION_METHODS: { value: ApplicationMethod; label: string }[] = [
  { value: 'pulverizacion', label: 'Pulverización' },
  { value: 'atomizacion', label: 'Atomización' },
  { value: 'espolvoreo', label: 'Espolvoreo' },
  { value: 'tratamiento_semillas', label: 'Tratamiento de semillas' },
  { value: 'inyeccion', label: 'Inyección' },
  { value: 'riego', label: 'Aplicación en riego' },
  { value: 'otros', label: 'Otros' },
]

export interface Parcel {
  id: string
  name: string
  crop: string
  hectares: number
  /** Identificador SIGPAC / referencia catastral simplificada (demo) */
  sigpacRef?: string
  coordinates: [number, number][]
  color: string
}

export interface PhytosanitaryProduct {
  id: string
  name: string
  registrationNumber: string
  activeIngredient: string
  type: PhytosanitaryType
  defaultDose: number
  unit: DoseUnit
  /** Dosis máxima autorizada de ejemplo para validación */
  maxDose: number
  safetyDays: number
}

export interface FertilizerProduct {
  id: string
  name: string
  fertilizerType: string
  n: number
  p: number
  k: number
  defaultDose: number
  unit: 'kg/ha' | 'l/ha'
}

/** Registro fitosanitario — campos obligatorios para cumplimiento */
export interface TreatmentRecord {
  id: string
  type: 'tratamiento'
  /** Marca temporal de creación; el registro no se edita ni borra */
  createdAt: string
  date: string
  parcelIds: string[]
  treatedAreaHa: number
  crop: string
  productId: string
  /** Datos denormalizados para historial inalterable */
  productName: string
  registrationNumber: string
  activeIngredient: string
  dose: number
  doseUnit: DoseUnit
  applicator: string
  safetyDays: number
  applicationMethod: ApplicationMethod
  notes?: string
  sentToSiex: boolean
  sentToSiexAt?: string
}

export interface FertilizationRecord {
  id: string
  type: 'fertilizacion'
  createdAt: string
  date: string
  parcelIds: string[]
  treatedAreaHa: number
  fertilizerProductId?: string
  fertilizerName: string
  fertilizerType: string
  dose: number
  doseUnit: 'kg/ha' | 'l/ha'
  n?: number
  p?: number
  k?: number
  applicator: string
  notes?: string
  sentToSiex: boolean
  sentToSiexAt?: string
}

export type FieldRecord = TreatmentRecord | FertilizationRecord

export interface ValidationWarning {
  field?: string
  message: string
  severity: 'warning' | 'error'
}
