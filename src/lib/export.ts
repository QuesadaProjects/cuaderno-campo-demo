import { FARM_NAME, FARM_NIF, formatDate, methodLabel } from '../data/sampleData'
import type { FieldRecord, FertilizationRecord, Parcel, TreatmentRecord } from '../types'

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Estructura JSON simulada compatible conceptualmente con exportación SIEX */
export function buildSiexJson(
  records: FieldRecord[],
  parcels: Parcel[],
  options?: { parcelId?: string },
) {
  const filtered = options?.parcelId
    ? records.filter((r) =>
        r.type === 'tratamiento'
          ? r.parcelIds.includes(options.parcelId!)
          : r.parcelId === options.parcelId,
      )
    : records

  const parcelMap = Object.fromEntries(parcels.map((p) => [p.id, p]))

  return {
    esquema: 'SIEX-CUADERNO-DEMO-1.0',
    generadoEn: new Date().toISOString(),
    explotacion: {
      nombre: FARM_NAME,
      nif: FARM_NIF,
    },
    tratamientosFitosanitarios: filtered
      .filter((r): r is TreatmentRecord => r.type === 'tratamiento')
      .map((r) => ({
        idRegistro: r.id,
        fechaTratamiento: r.date,
        fechaAlta: r.createdAt,
        parcelas: r.parcelIds.map((id) => ({
          id,
          nombre: parcelMap[id]?.name,
          referenciaSigpac: parcelMap[id]?.sigpacRef,
        })),
        superficieTratadaHa: r.treatedAreaHa,
        cultivo: r.crop,
        producto: {
          nombreComercial: r.productName,
          numeroRegistro: r.registrationNumber,
          materiaActiva: r.activeIngredient,
        },
        dosis: r.dose,
        unidadDosis: r.doseUnit,
        aplicador: r.applicator,
        plazoSeguridadDias: r.safetyDays,
        metodoAplicacion: r.applicationMethod,
        observaciones: r.notes ?? null,
        enviadoSiex: r.sentToSiex,
        enviadoSiexEn: r.sentToSiexAt ?? null,
      })),
    fertilizaciones: filtered
      .filter((r): r is FertilizationRecord => r.type === 'fertilizacion')
      .map((r) => ({
        idRegistro: r.id,
        fecha: r.date,
        fechaAlta: r.createdAt,
        parcela: {
          id: r.parcelId,
          nombre: parcelMap[r.parcelId]?.name,
          referenciaSigpac: parcelMap[r.parcelId]?.sigpacRef,
        },
        fertilizante: r.fertilizerName,
        tipo: r.fertilizerType,
        dosis: r.dose,
        unidadDosis: r.doseUnit,
        nutrientes: { N: r.n ?? null, P: r.p ?? null, K: r.k ?? null },
        aplicador: r.applicator,
        observaciones: r.notes ?? null,
        enviadoSiex: r.sentToSiex,
        enviadoSiexEn: r.sentToSiexAt ?? null,
      })),
  }
}

export function exportSiexJson(records: FieldRecord[], parcels: Parcel[], parcelId?: string) {
  const data = buildSiexJson(records, parcels, { parcelId })
  const stamp = new Date().toISOString().slice(0, 10)
  downloadBlob(
    JSON.stringify(data, null, 2),
    `cuaderno-siex-${stamp}.json`,
    'application/json;charset=utf-8',
  )
}

export function exportSiexCsv(records: FieldRecord[], parcels: Parcel[], parcelId?: string) {
  const data = buildSiexJson(records, parcels, { parcelId })
  const rows: string[][] = [
    [
      'tipo',
      'id',
      'fecha',
      'parcela',
      'superficie_ha',
      'cultivo',
      'producto',
      'n_registro',
      'materia_activa',
      'dosis',
      'unidad',
      'N',
      'P',
      'K',
      'aplicador',
      'plazo_seguridad',
      'metodo',
      'enviado_siex',
      'observaciones',
    ],
  ]

  for (const t of data.tratamientosFitosanitarios) {
    rows.push([
      'tratamiento',
      t.idRegistro,
      t.fechaTratamiento,
      t.parcelas.map((p) => p.nombre).join('; '),
      String(t.superficieTratadaHa),
      t.cultivo,
      t.producto.nombreComercial,
      t.producto.numeroRegistro,
      t.producto.materiaActiva,
      String(t.dosis),
      t.unidadDosis,
      '',
      '',
      '',
      t.aplicador,
      String(t.plazoSeguridadDias),
      t.metodoAplicacion,
      t.enviadoSiex ? 'si' : 'no',
      t.observaciones ?? '',
    ])
  }

  for (const f of data.fertilizaciones) {
    rows.push([
      'fertilizacion',
      f.idRegistro,
      f.fecha,
      f.parcela.nombre ?? '',
      '',
      '',
      f.fertilizante,
      '',
      '',
      String(f.dosis),
      f.unidadDosis,
      f.nutrientes.N == null ? '' : String(f.nutrientes.N),
      f.nutrientes.P == null ? '' : String(f.nutrientes.P),
      f.nutrientes.K == null ? '' : String(f.nutrientes.K),
      f.aplicador,
      '',
      '',
      f.enviadoSiex ? 'si' : 'no',
      f.observaciones ?? '',
    ])
  }

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'),
    )
    .join('\n')

  const stamp = new Date().toISOString().slice(0, 10)
  downloadBlob('\uFEFF' + csv, `cuaderno-siex-${stamp}.csv`, 'text/csv;charset=utf-8')
}

/** PDF legible simulado vía ventana de impresión del navegador */
export function exportReadablePdf(
  records: FieldRecord[],
  parcels: Parcel[],
  options?: { parcelId?: string; title?: string },
) {
  const data = buildSiexJson(records, parcels, { parcelId: options?.parcelId })
  const title = options?.title ?? `Cuaderno oficial — ${FARM_NAME}`

  const treatmentRows = data.tratamientosFitosanitarios
    .map(
      (t) => `
      <tr>
        <td>${formatDate(t.fechaTratamiento)}</td>
        <td>${t.parcelas.map((p) => p.nombre).join(', ')} (${t.superficieTratadaHa} ha)</td>
        <td>${t.cultivo}</td>
        <td>${t.producto.nombreComercial}<br/><small>Reg. ${t.producto.numeroRegistro} · ${t.producto.materiaActiva}</small></td>
        <td>${t.dosis} ${t.unidadDosis}</td>
        <td>${t.aplicador}</td>
        <td>${t.plazoSeguridadDias} d</td>
        <td>${methodLabel(t.metodoAplicacion)}</td>
        <td>${t.enviadoSiex ? 'Sí' : 'Pendiente'}</td>
      </tr>`,
    )
    .join('')

  const fertRows = data.fertilizaciones
    .map(
      (f) => `
      <tr>
        <td>${formatDate(f.fecha)}</td>
        <td>${f.parcela.nombre ?? ''}</td>
        <td>${f.fertilizante} (${f.tipo})</td>
        <td>${f.dosis} ${f.unidadDosis}</td>
        <td>N ${f.nutrientes.N ?? '—'} · P ${f.nutrientes.P ?? '—'} · K ${f.nutrientes.K ?? '—'}</td>
        <td>${f.aplicador}</td>
        <td>${f.enviadoSiex ? 'Sí' : 'Pendiente'}</td>
      </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #0f172a; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 28px 0 10px; color: #14532d; }
    p.meta { color: #64748b; font-size: 13px; margin: 0 0 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f0fdf4; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">${FARM_NAME} · NIF ${FARM_NIF} · Generado ${new Date().toLocaleString('es-ES')} · <span class="badge">Demo SIEX</span></p>

  <h2>Tratamientos fitosanitarios (${data.tratamientosFitosanitarios.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Fecha</th><th>Parcela / ha</th><th>Cultivo</th><th>Producto</th>
        <th>Dosis</th><th>Aplicador</th><th>P. seg.</th><th>Método</th><th>SIEX</th>
      </tr>
    </thead>
    <tbody>${treatmentRows || '<tr><td colspan="9">Sin registros</td></tr>'}</tbody>
  </table>

  <h2>Fertilizaciones (${data.fertilizaciones.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Fecha</th><th>Parcela</th><th>Fertilizante</th><th>Dosis</th>
        <th>N-P-K</th><th>Aplicador</th><th>SIEX</th>
      </tr>
    </thead>
    <tbody>${fertRows || '<tr><td colspan="7">Sin registros</td></tr>'}</tbody>
  </table>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720')
  if (!win) {
    window.alert('Permite ventanas emergentes para generar el PDF.')
    return
  }
  win.document.write(html)
  win.document.close()
}
