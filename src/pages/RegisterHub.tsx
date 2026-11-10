import { Link } from 'react-router-dom'

export function RegisterHub() {
  return (
    <div className="animate-fade-up flex min-h-dvh flex-col px-5 pt-6 pb-8">
      <div className="mb-2 flex items-center gap-3">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-slate-600"
          aria-label="Volver"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5 7 10l5.5 5.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Nuevo registro</h1>
          <p className="text-sm text-muted">Cumplimiento SIEX · historial inalterable</p>
        </div>
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-4">
        <Link
          to="/registrar/tratamiento"
          className="rounded-3xl border border-brand/20 bg-brand-muted p-6 transition hover:border-brand/40"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Obligatorio</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Tratamiento fitosanitario</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Producto, nº de registro, dosis, aplicador, método, plazo de seguridad y parcela.
          </p>
        </Link>

        <Link
          to="/registrar/fertilizacion"
          className="rounded-3xl border border-line bg-surface p-6 transition hover:border-sky-300"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Fertilización</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Registro de fertilización</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Tipo de abono, dosis y nutrientes N-P-K por parcela.
          </p>
        </Link>
      </div>
    </div>
  )
}
