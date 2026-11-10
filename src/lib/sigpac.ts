import type { Parcel } from '../types'

const CROPS = ['Olivar', 'Viña', 'Trigo', 'Almendro', 'Hortalizas', 'Cebada'] as const
const NAME_PREFIX = ['Parcela', 'Recinto', 'Finca', 'Bancal'] as const
const COLORS = ['#16a34a', '#65a30d', '#ca8a04', '#059669', '#0d9488', '#2563eb', '#7c3aed']

/** Normaliza una referencia SIGPAC introducida por el usuario */
export function normalizeSigpacRef(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[./_-]+/g, ':')
}

/** Validación básica de formato (demo): provincia:municipio:polígono:parcela */
export function isValidSigpacFormat(ref: string): boolean {
  const parts = normalizeSigpacRef(ref).split(':').filter(Boolean)
  return parts.length >= 3 && parts.every((p) => /^[0-9A-Z]+$/.test(p))
}

function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Simula la resolución de una referencia SIGPAC a datos de parcela.
 * En producción esto vendría de un servicio oficial; aquí genera datos realistas y deterministas.
 */
export function resolveSigpacDemo(
  rawRef: string,
  existingCount: number,
): Omit<Parcel, 'id'> {
  const sigpacRef = normalizeSigpacRef(rawRef)
  const h = hashString(sigpacRef)
  const crop = CROPS[h % CROPS.length]!
  const prefix = NAME_PREFIX[(h >> 3) % NAME_PREFIX.length]!
  const hectares = Math.round((2 + (h % 180) / 10) * 10) / 10 // 2.0 – 19.9 ha

  // Desplazamiento alrededor de Úbeda (Jaén) para no solapar del todo con las de ejemplo
  const baseLat = 38.012 + ((h % 50) - 25) * 0.00035 + existingCount * 0.0035
  const baseLng = -3.372 + (((h >> 5) % 50) - 25) * 0.0004 + existingCount * 0.0025
  const w = 0.003 + (h % 10) * 0.00015
  const ht = 0.0025 + ((h >> 2) % 10) * 0.00012

  const coordinates: [number, number][] = [
    [baseLat + ht, baseLng - w],
    [baseLat + ht, baseLng + w],
    [baseLat - ht, baseLng + w],
    [baseLat - ht, baseLng - w],
  ]

  const shortCode = sigpacRef.split(':').slice(-2).join('-') || sigpacRef.slice(-6)

  return {
    name: `${prefix} ${shortCode}`,
    crop,
    hectares,
    sigpacRef,
    color: COLORS[h % COLORS.length]!,
    coordinates,
  }
}
