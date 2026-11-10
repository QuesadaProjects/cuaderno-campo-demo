import { getPhytoById } from '../data/sampleData'
import type { DoseUnit, ValidationWarning } from '../types'

export function parseDoseInput(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!normalized) return null
  const n = Number(normalized)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function validateTreatment(input: {
  parcelIds: string[]
  treatedAreaHa: number
  crop: string
  productId: string | null
  doseRaw: string
  doseUnit: DoseUnit
  applicator: string
  date: string
  applicationMethod: string
  allowUnknownProduct?: boolean
  unknownProductName?: string
}): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  if (input.parcelIds.length === 0) {
    warnings.push({ field: 'parcelas', message: 'Selecciona al menos una parcela', severity: 'error' })
  }
  if (!input.date) {
    warnings.push({ field: 'fecha', message: 'La fecha es obligatoria', severity: 'error' })
  }
  if (!input.crop.trim()) {
    warnings.push({ field: 'cultivo', message: 'Indica el cultivo tratado', severity: 'error' })
  }
  if (!input.applicator.trim()) {
    warnings.push({ field: 'aplicador', message: 'Indica el nombre del aplicador', severity: 'error' })
  }
  if (!input.applicationMethod) {
    warnings.push({ field: 'metodo', message: 'Selecciona el método de aplicación', severity: 'error' })
  }
  if (!(input.treatedAreaHa > 0)) {
    warnings.push({
      field: 'superficie',
      message: 'La superficie tratada debe ser mayor que 0',
      severity: 'error',
    })
  }

  const dose = parseDoseInput(input.doseRaw)
  if (dose === null) {
    warnings.push({ field: 'dosis', message: 'Indica una dosis numérica válida', severity: 'error' })
  }

  const product = input.productId ? getPhytoById(input.productId) : undefined

  if (!product && !input.allowUnknownProduct) {
    warnings.push({
      field: 'producto',
      message: 'Selecciona un producto de la lista autorizada de ejemplo',
      severity: 'error',
    })
  }

  if (!product && input.allowUnknownProduct) {
    if (!input.unknownProductName?.trim()) {
      warnings.push({
        field: 'producto',
        message: 'Escribe el nombre del producto',
        severity: 'error',
      })
    } else {
      warnings.push({
        field: 'producto',
        message:
          'Este producto no está en la lista de ejemplo. Verifica el nº de registro antes de usarlo en producción.',
        severity: 'warning',
      })
    }
  }

  if (product && dose !== null) {
    if (dose > product.maxDose) {
      warnings.push({
        field: 'dosis',
        message: `La dosis (${dose} ${input.doseUnit}) supera el máximo de ejemplo autorizado (${product.maxDose} ${product.unit}).`,
        severity: 'warning',
      })
    }
    if (dose > product.maxDose * 1.5) {
      warnings.push({
        field: 'dosis',
        message: 'La dosis parece excesiva. Revisa la etiqueta del producto.',
        severity: 'error',
      })
    }
  }

  return warnings
}

export function validateFertilization(input: {
  parcelIds: string[]
  treatedAreaHa: number
  date: string
  fertilizerName: string
  fertilizerType: string
  doseRaw: string
  applicator: string
}): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  if (input.parcelIds.length === 0) {
    warnings.push({ field: 'parcela', message: 'Selecciona al menos una parcela', severity: 'error' })
  }
  if (!input.date) {
    warnings.push({ field: 'fecha', message: 'La fecha es obligatoria', severity: 'error' })
  }
  if (!input.fertilizerName.trim()) {
    warnings.push({ field: 'fertilizante', message: 'Indica el fertilizante o abono', severity: 'error' })
  }
  if (!input.fertilizerType.trim()) {
    warnings.push({ field: 'tipo', message: 'Indica el tipo de fertilizante', severity: 'error' })
  }
  if (!(input.treatedAreaHa > 0)) {
    warnings.push({
      field: 'superficie',
      message: 'La superficie fertilizada debe ser mayor que 0',
      severity: 'error',
    })
  }
  if (parseDoseInput(input.doseRaw) === null) {
    warnings.push({ field: 'dosis', message: 'Indica una dosis numérica válida', severity: 'error' })
  }
  if (!input.applicator.trim()) {
    warnings.push({ field: 'aplicador', message: 'Indica el nombre del aplicador', severity: 'error' })
  }
  return warnings
}
