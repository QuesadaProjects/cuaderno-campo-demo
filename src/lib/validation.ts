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
    warnings.push({
      field: 'parcelas',
      message: 'Elige al menos una parcela para continuar',
      severity: 'error',
    })
  }
  if (!input.date) {
    warnings.push({ field: 'fecha', message: 'Falta la fecha del tratamiento', severity: 'error' })
  }
  if (!input.crop.trim()) {
    warnings.push({ field: 'cultivo', message: 'Falta indicar el cultivo', severity: 'error' })
  }
  if (!input.applicator.trim()) {
    warnings.push({
      field: 'aplicador',
      message: 'Falta el nombre del aplicador',
      severity: 'error',
    })
  }
  if (!input.applicationMethod) {
    warnings.push({
      field: 'metodo',
      message: 'Elige un método de aplicación',
      severity: 'error',
    })
  }
  if (!(input.treatedAreaHa > 0)) {
    warnings.push({
      field: 'superficie',
      message: 'Indica la superficie tratada en hectáreas',
      severity: 'error',
    })
  }

  const dose = parseDoseInput(input.doseRaw)
  if (dose === null) {
    warnings.push({
      field: 'dosis',
      message: 'Escribe la dosis con un número (por ejemplo 2 o 0,3)',
      severity: 'error',
    })
  }

  const product = input.productId ? getPhytoById(input.productId) : undefined

  if (!product && !input.allowUnknownProduct) {
    warnings.push({
      field: 'producto',
      message: 'Elige un producto de la lista para continuar',
      severity: 'error',
    })
  }

  if (!product && input.allowUnknownProduct) {
    if (!input.unknownProductName?.trim()) {
      warnings.push({
        field: 'producto',
        message: 'Escribe el nombre comercial del producto',
        severity: 'error',
      })
    } else {
      warnings.push({
        field: 'producto',
        message:
          'Este producto no está en la lista de ejemplo. Comprueba el nº de registro si lo usas en producción.',
        severity: 'warning',
      })
    }
  }

  // Aviso suave: no bloquea el guardado
  if (product && dose !== null && dose > product.maxDose) {
    warnings.push({
      field: 'dosis',
      message: `La dosis supera el máximo de ejemplo (${product.maxDose} ${product.unit}). Puedes continuar si es correcto.`,
      severity: 'warning',
    })
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
    warnings.push({
      field: 'parcela',
      message: 'Elige al menos una parcela para continuar',
      severity: 'error',
    })
  }
  if (!input.date) {
    warnings.push({ field: 'fecha', message: 'Falta la fecha', severity: 'error' })
  }
  if (!input.fertilizerName.trim()) {
    warnings.push({
      field: 'fertilizante',
      message: 'Falta el nombre del fertilizante o abono',
      severity: 'error',
    })
  }
  if (!input.fertilizerType.trim()) {
    warnings.push({
      field: 'tipo',
      message: 'Falta el tipo de fertilizante',
      severity: 'error',
    })
  }
  if (!(input.treatedAreaHa > 0)) {
    warnings.push({
      field: 'superficie',
      message: 'Indica la superficie fertilizada en hectáreas',
      severity: 'error',
    })
  }
  if (parseDoseInput(input.doseRaw) === null) {
    warnings.push({
      field: 'dosis',
      message: 'Escribe la dosis con un número (por ejemplo 200)',
      severity: 'error',
    })
  }
  if (!input.applicator.trim()) {
    warnings.push({
      field: 'aplicador',
      message: 'Falta el nombre del aplicador',
      severity: 'error',
    })
  }
  return warnings
}
