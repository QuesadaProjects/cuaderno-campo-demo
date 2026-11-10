import { useApp } from '../context/AppContext'

export function PremiumModal() {
  const { premiumOpen, closePremium, premiumReason } = useApp()

  if (!premiumOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={closePremium}
      />
      <div className="animate-fade-up relative z-10 mx-4 mb-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:mb-0">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
          Premium
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Lleva tu finca al siguiente nivel</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{premiumReason}</p>

        <ul className="mt-5 space-y-3 text-sm text-slate-700">
          {[
            'Control de costes y rentabilidad por parcela',
            'Multi-usuario sin límite',
            'Alertas avanzadas y plazos inteligentes',
            'Integración con técnicos y cooperativa',
            'Soporte prioritario',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-surface p-4 text-center">
            <p className="text-2xl font-semibold text-ink">19 €</p>
            <p className="text-xs text-muted">al mes</p>
          </div>
          <div className="rounded-2xl border border-brand/30 bg-brand-muted p-4 text-center">
            <p className="text-2xl font-semibold text-brand">190 €</p>
            <p className="text-xs text-muted">al año · 2 meses gratis</p>
          </div>
        </div>

        <button
          type="button"
          onClick={closePremium}
          className="mt-5 w-full rounded-2xl bg-brand py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-light"
        >
          Probar Premium (demo)
        </button>
        <button
          type="button"
          onClick={closePremium}
          className="mt-2 w-full py-2.5 text-sm font-medium text-muted hover:text-slate-700"
        >
          Seguir con el plan gratis
        </button>
      </div>
    </div>
  )
}
