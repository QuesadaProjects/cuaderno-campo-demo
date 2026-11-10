import type {
  FertilizationRecord,
  FertilizerProduct,
  Parcel,
  PhytosanitaryProduct,
  TreatmentRecord,
} from '../types'

/** Coordenadas de ejemplo cerca de Úbeda (Jaén) */
const BASE: [number, number] = [38.012, -3.372]

export const PARCEL_COLORS = ['#16a34a', '#65a30d', '#ca8a04', '#059669', '#0d9488', '#2563eb']

export const initialParcels: Parcel[] = [
  {
    id: 'p1',
    name: 'Olivar Norte',
    crop: 'Olivar',
    hectares: 12,
    sigpacRef: '23:097:0001:00001',
    color: '#16a34a',
    coordinates: [
      [BASE[0] + 0.018, BASE[1] - 0.012],
      [BASE[0] + 0.018, BASE[1] + 0.002],
      [BASE[0] + 0.006, BASE[1] + 0.002],
      [BASE[0] + 0.006, BASE[1] - 0.012],
    ],
  },
  {
    id: 'p2',
    name: 'Viñedo Sur',
    crop: 'Viña',
    hectares: 8,
    sigpacRef: '23:097:0001:00002',
    color: '#65a30d',
    coordinates: [
      [BASE[0] - 0.002, BASE[1] - 0.008],
      [BASE[0] - 0.002, BASE[1] + 0.006],
      [BASE[0] - 0.012, BASE[1] + 0.006],
      [BASE[0] - 0.012, BASE[1] - 0.008],
    ],
  },
  {
    id: 'p3',
    name: 'Cereal Este',
    crop: 'Trigo',
    hectares: 15,
    sigpacRef: '23:097:0002:00001',
    color: '#ca8a04',
    coordinates: [
      [BASE[0] + 0.014, BASE[1] + 0.006],
      [BASE[0] + 0.014, BASE[1] + 0.022],
      [BASE[0] - 0.002, BASE[1] + 0.022],
      [BASE[0] - 0.002, BASE[1] + 0.006],
    ],
  },
  {
    id: 'p4',
    name: 'Huerto',
    crop: 'Hortalizas',
    hectares: 3,
    sigpacRef: '23:097:0003:00001',
    color: '#059669',
    coordinates: [
      [BASE[0] + 0.004, BASE[1] - 0.016],
      [BASE[0] + 0.004, BASE[1] - 0.01],
      [BASE[0] - 0.002, BASE[1] - 0.01],
      [BASE[0] - 0.002, BASE[1] - 0.016],
    ],
  },
]

/** Productos fitosanitarios de ejemplo con nº de registro ficticio */
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

export const initialTreatments: TreatmentRecord[] = [
  {
    id: 't1',
    type: 'tratamiento',
    createdAt: '2026-11-02T09:14:00.000Z',
    date: '2026-11-02',
    parcelIds: ['p1'],
    treatedAreaHa: 12,
    crop: 'Olivar',
    productId: 'fit2',
    productName: 'Cuprocol',
    registrationNumber: 'ES-18234',
    activeIngredient: 'Oxicloruro de cobre 50%',
    dose: 2,
    doseUnit: 'kg/ha',
    applicator: 'Joaquín Ruiz',
    safetyDays: 14,
    applicationMethod: 'pulverizacion',
    notes: 'Tratamiento preventivo repilo',
    sentToSiex: true,
    sentToSiexAt: '2026-11-03T08:00:00.000Z',
  },
  {
    id: 't2',
    type: 'tratamiento',
    createdAt: '2026-11-05T11:20:00.000Z',
    date: '2026-11-05',
    parcelIds: ['p2'],
    treatedAreaHa: 8,
    crop: 'Viña',
    productId: 'fit3',
    productName: 'Karate Zeon',
    registrationNumber: 'ES-20156',
    activeIngredient: 'Lambda-cihalotrin 100 g/l',
    dose: 0.075,
    doseUnit: 'l/ha',
    applicator: 'Joaquín Ruiz',
    safetyDays: 7,
    applicationMethod: 'atomizacion',
    notes: 'Polilla del racimo',
    sentToSiex: false,
  },
  {
    id: 't3',
    type: 'tratamiento',
    createdAt: '2026-10-20T16:05:00.000Z',
    date: '2026-10-20',
    parcelIds: ['p2'],
    treatedAreaHa: 8,
    crop: 'Viña',
    productId: 'fit5',
    productName: 'Systhane Forte',
    registrationNumber: 'ES-15432',
    activeIngredient: 'Myclobutanil 240 g/l',
    dose: 0.2,
    doseUnit: 'l/ha',
    applicator: 'María López',
    safetyDays: 14,
    applicationMethod: 'pulverizacion',
    notes: 'Oídio en racimo',
    sentToSiex: true,
    sentToSiexAt: '2026-10-21T10:00:00.000Z',
  },
  {
    id: 't4',
    type: 'tratamiento',
    createdAt: '2026-10-15T08:40:00.000Z',
    date: '2026-10-15',
    parcelIds: ['p4'],
    treatedAreaHa: 3,
    crop: 'Hortalizas',
    productId: 'fit1',
    productName: 'Roundup UltraPlus',
    registrationNumber: 'ES-24567',
    activeIngredient: 'Glifosato 360 g/l',
    dose: 2.5,
    doseUnit: 'l/ha',
    applicator: 'Joaquín Ruiz',
    safetyDays: 7,
    applicationMethod: 'pulverizacion',
    sentToSiex: true,
    sentToSiexAt: '2026-10-16T09:00:00.000Z',
  },
  {
    id: 't5',
    type: 'tratamiento',
    createdAt: '2026-09-18T14:22:00.000Z',
    date: '2026-09-18',
    parcelIds: ['p3'],
    treatedAreaHa: 15,
    crop: 'Trigo',
    productId: 'fit6',
    productName: 'Decis Expert',
    registrationNumber: 'ES-19876',
    activeIngredient: 'Deltametrina 25 g/l',
    dose: 0.3,
    doseUnit: 'l/ha',
    applicator: 'María López',
    safetyDays: 7,
    applicationMethod: 'pulverizacion',
    sentToSiex: true,
    sentToSiexAt: '2026-09-19T11:00:00.000Z',
  },
]

export const initialFertilizations: FertilizationRecord[] = [
  {
    id: 'f1',
    type: 'fertilizacion',
    createdAt: '2026-10-28T10:00:00.000Z',
    date: '2026-10-28',
    parcelIds: ['p3'],
    treatedAreaHa: 15,
    fertilizerProductId: 'fer1',
    fertilizerName: 'Nitrato amónico 27%',
    fertilizerType: 'Nitrogenado',
    dose: 180,
    doseUnit: 'kg/ha',
    n: 27,
    p: 0,
    k: 0,
    applicator: 'Joaquín Ruiz',
    sentToSiex: true,
    sentToSiexAt: '2026-10-29T08:30:00.000Z',
  },
  {
    id: 'f2',
    type: 'fertilizacion',
    createdAt: '2026-09-30T09:15:00.000Z',
    date: '2026-09-30',
    parcelIds: ['p1'],
    treatedAreaHa: 12,
    fertilizerProductId: 'fer2',
    fertilizerName: 'Abono NPK 15-15-15',
    fertilizerType: 'Complejo NPK',
    dose: 250,
    doseUnit: 'kg/ha',
    n: 15,
    p: 15,
    k: 15,
    applicator: 'Joaquín Ruiz',
    sentToSiex: true,
    sentToSiexAt: '2026-10-01T09:00:00.000Z',
  },
]

/** Compatibilidad con registros antiguos guardados en localStorage */
export function fertParcelIds(record: {
  parcelIds?: string[]
  parcelId?: string
}): string[] {
  if (record.parcelIds?.length) return record.parcelIds
  if (record.parcelId) return [record.parcelId]
  return []
}

export const DEFAULT_APPLICATOR = 'Joaquín Ruiz'
export const FARM_NAME = 'Finca Los Olivos'
export const FARM_NIF = 'B12345678'
export const STORAGE_KEY = 'campolibre-cuaderno-v3'

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

/** Días restantes de plazo de seguridad (null si no aplica o ya venció hace tiempo) */
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
