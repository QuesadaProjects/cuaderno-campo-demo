import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_BRAND } from '../data/sampleData'

type Mode = 'login' | 'register'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 12s3.5-6.5 8.5-6.5S20.5 12 20.5 12s-3.5 6.5-8.5 6.5S3.5 12 3.5 12Z"
        />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 12s3.5-6.5 8.5-6.5S20.5 12 20.5 12s-3.5 6.5-8.5 6.5S3.5 12 3.5 12Z"
      />
      <circle cx="12" cy="12" r="2.5" />
      <path strokeLinecap="round" d="M4 20 20 4" />
    </svg>
  )
}

export function Login() {
  const { session, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setInfo(null)
    setShowPassword(false)
    setShowConfirm(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    const trimmed = email.trim()
    if (!trimmed || !password) {
      setError('Introduce email y contraseña')
      return
    }
    if (mode === 'register') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }
      if (password !== confirm) {
        setError('Las contraseñas no coinciden')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        const { error: signInError } = await signIn(trimmed, password)
        if (signInError) setError(signInError)
      } else {
        const { error: signUpError, needsConfirmation } = await signUp(trimmed, password)
        if (signUpError) {
          setError(signUpError)
        } else if (needsConfirmation) {
          setInfo(
            'Cuenta creada. Revisa tu email para confirmar el registro e inicia sesión después.',
          )
          setMode('login')
          setPassword('')
          setConfirm('')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setInfo(null)
    setGoogleLoading(true)
    try {
      const { error: googleError } = await signInWithGoogle()
      if (googleError) setError(googleError)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-white shadow-[0_0_60px_rgba(15,23,42,0.04)]">
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-muted via-white to-white px-5 pb-4 pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 top-24 h-40 w-40 rounded-full bg-brand-light/20 blur-2xl"
        />
        <p className="relative text-sm font-semibold tracking-wide text-brand">{APP_BRAND}</p>
        <h1 className="relative mt-2 text-3xl font-semibold tracking-tight text-ink">
          {mode === 'login' ? 'Accede a tu cuaderno' : 'Crea tu cuenta'}
        </h1>
        <p className="relative mt-2 max-w-sm text-sm text-muted">
          {mode === 'login'
            ? 'Inicia sesión para gestionar parcelas, tratamientos y fertilizaciones.'
            : 'Regístrate para empezar a usar el cuaderno de campo SIEX.'}
        </p>
      </div>

      <div className="animate-fade-up flex flex-1 flex-col px-5 pb-10 pt-2">
        <div className="mb-5 grid grid-cols-2 rounded-2xl border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-muted'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-muted'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 outline-none ring-brand/30 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-line bg-surface py-3.5 pr-12 pl-4 outline-none ring-brand/30 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirmar contraseña
              </span>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-line bg-surface py-3.5 pr-12 pl-4 outline-none ring-brand/30 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </label>
          )}

          {error && (
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-950">{error}</p>
          )}
          {info && (
            <p className="rounded-xl bg-brand-muted px-3 py-2.5 text-sm text-ink">{info}</p>
          )}

          <button
            type="submit"
            disabled={submitting || googleLoading || loading}
            className="w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting
              ? mode === 'login'
                ? 'Entrando…'
                : 'Creando cuenta…'
              : mode === 'login'
                ? 'Entrar'
                : 'Crear cuenta'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">o</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={() => void handleGoogle()}
          disabled={submitting || googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-surface disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {googleLoading ? 'Conectando con Google…' : 'Continuar con Google'}
        </button>

        <p className="mt-auto pt-8 text-center text-xs text-slate-400">
          Demo CampoLibre · autenticación con Supabase
        </p>
      </div>
    </div>
  )
}
